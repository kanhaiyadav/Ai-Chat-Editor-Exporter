/**
 * Google Drive Sync Service - Backend API Version
 *
 * This service handles syncing chats and presets to Google Drive via backend proxy.
 *
 * Benefits of backend approach:
 * - Works in ALL browsers (Chrome, Edge, Brave, Opera, Firefox, etc.)
 * - No extension ID dependency for OAuth redirect
 * - Refresh tokens stored securely on backend
 * - Single redirect URI to configure in Google Cloud Console
 */

import { SavedChat, SavedPreset } from "./settingsDB";

export interface SyncStatus {
    enabled: boolean;
    lastSync: Date | null;
    syncInProgress: boolean;
    error: string | null;
    authenticated: boolean;
    email?: string;
}

export interface DriveFile {
    id: string;
    name: string;
    modifiedTime: string;
}

export interface SyncData {
    chats: SavedChat[];
    presets: SavedPreset[];
    version: string;
    lastModified: Date;
}

// Interface for tracking deletions
interface DeletionRecord {
    type: "chat" | "preset";
    syncId: string;
    deletedAt: string;
}

interface DeletionsData {
    deletions: DeletionRecord[];
    version: string;
}

// Backend API Configuration
// In production, change this to your deployed backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const CHATS_FILE_NAME = "chats.json";
const PRESETS_FILE_NAME = "presets.json";
const DELETIONS_FILE_NAME = "deletions.json";

class GoogleDriveSyncBackend {
    private sessionToken: string | null = null;
    private userEmail: string | null = null;

    constructor() {
        // Load session from storage on init
        this.loadSession();
    }

    /**
     * Load session from storage
     */
    private async loadSession(): Promise<void> {
        try {
            const result = await chrome.storage.local.get("backendSession");
            if (result.backendSession) {
                this.sessionToken = result.backendSession.token;
                this.userEmail = result.backendSession.email;
            }
        } catch (e) {
            console.error("Failed to load session:", e);
        }
    }

    /**
     * Save session to storage
     */
    private async saveSession(token: string, email: string): Promise<void> {
        this.sessionToken = token;
        this.userEmail = email;
        await chrome.storage.local.set({
            backendSession: { token, email },
        });
    }

    /**
     * Clear session from storage
     */
    private async clearSession(): Promise<void> {
        this.sessionToken = null;
        this.userEmail = null;
        await chrome.storage.local.remove("backendSession");
    }

    /**
     * Get the backend URL (for display/debugging)
     */
    getBackendUrl(): string {
        return BACKEND_URL;
    }

    /**
     * Check if backend is configured and reachable
     */
    async hasCredentials(): Promise<boolean> {
        try {
            const response = await fetch(`${BACKEND_URL}/health`, {
                method: "GET",
                signal: AbortSignal.timeout(5000),
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        await this.loadSession();
        if (!this.sessionToken) {
            return false;
        }

        try {
            const response = await this.apiRequest("/auth/status");
            return response.authenticated === true;
        } catch {
            return false;
        }
    }

    /**
     * Get authenticated user email
     */
    getEmail(): string | null {
        return this.userEmail;
    }

    /**
     * Make authenticated API request to backend
     */
    private async apiRequest(
        path: string,
        options: RequestInit = {}
    ): Promise<any> {
        if (!this.sessionToken) {
            throw new Error("Not authenticated");
        }

        const response = await fetch(`${BACKEND_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "X-Session-Token": this.sessionToken,
                ...options.headers,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                await this.clearSession();
                await this.storeSyncStatus({ authenticated: false });
                throw new Error("Session expired, please re-authenticate");
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.error || `Request failed: ${response.status}`
            );
        }

        return response.json();
    }

    /**
     * Start OAuth flow - opens backend OAuth URL
     * Returns the URL to open (extension handles opening it)
     */
    getOAuthUrl(): string {
        return `${BACKEND_URL}/oauth/google`;
    }

    /**
     * Authenticate with Google via backend
     * Opens a new tab for OAuth, waits for token via manual entry
     */
    async authenticate(): Promise<boolean> {
        try {
            // Open OAuth URL in new tab
            const oauthUrl = this.getOAuthUrl();
            await chrome.tabs.create({ url: oauthUrl });

            // The user will need to paste the token from the success page
            // This is handled by the UI component (GoogleDriveTokenModal)
            return true;
        } catch (error) {
            console.error("Authentication failed:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Authentication failed";
            await this.updateSyncError(errorMessage);
            return false;
        }
    }

    /**
     * Complete authentication with session token from OAuth callback
     */
    async completeAuthentication(token: string): Promise<boolean> {
        try {
            // Temporarily set token to validate it
            this.sessionToken = token;

            // Validate token by checking auth status
            const status = await this.apiRequest("/auth/status");

            if (status.authenticated) {
                await this.saveSession(token, status.email);
                await this.storeSyncStatus({
                    authenticated: true,
                    email: status.email,
                    error: null,
                });
                return true;
            }

            this.sessionToken = null;
            return false;
        } catch (error) {
            this.sessionToken = null;
            console.error("Token validation failed:", error);
            await this.updateSyncError(
                error instanceof Error
                    ? error.message
                    : "Token validation failed"
            );
            return false;
        }
    }

    /**
     * Sign out from Google
     */
    async signOut(): Promise<void> {
        if (this.sessionToken) {
            try {
                await this.apiRequest("/auth/signout", { method: "POST" });
            } catch (e) {
                // Ignore signout errors
            }
        }

        await this.clearSession();
        await this.storeSyncStatus({
            authenticated: false,
            enabled: false,
            email: undefined,
        });
    }

    /**
     * Upload chats to Google Drive via backend
     */
    async uploadChats(chats: SavedChat[]): Promise<void> {
        const content = {
            chats: chats.map((chat) => ({
                ...chat,
                syncId: chat.syncId,
                createdAt: chat.createdAt.toISOString(),
                updatedAt: chat.updatedAt.toISOString(),
            })),
            version: "2.0",
            lastModified: new Date().toISOString(),
        };

        await this.apiRequest(`/drive/files/${CHATS_FILE_NAME}`, {
            method: "PUT",
            body: JSON.stringify(content),
        });
    }

    /**
     * Download chats from Google Drive via backend
     */
    async downloadChats(): Promise<SavedChat[]> {
        try {
            const data = await this.apiRequest(
                `/drive/files/${CHATS_FILE_NAME}`
            );

            if (!data || !data.chats) {
                return [];
            }

            return data.chats.map((chat: any) => ({
                ...chat,
                syncId: chat.syncId || crypto.randomUUID(),
                createdAt: new Date(chat.createdAt),
                updatedAt: new Date(chat.updatedAt),
            }));
        } catch (error: any) {
            if (
                error.message?.includes("404") ||
                error.message?.includes("not found")
            ) {
                return [];
            }
            throw error;
        }
    }

    /**
     * Upload presets to Google Drive via backend
     */
    async uploadPresets(presets: SavedPreset[]): Promise<void> {
        const content = {
            presets: presets.map((preset) => ({
                ...preset,
                syncId: preset.syncId,
                createdAt: preset.createdAt.toISOString(),
                updatedAt: preset.updatedAt.toISOString(),
            })),
            version: "2.0",
            lastModified: new Date().toISOString(),
        };

        await this.apiRequest(`/drive/files/${PRESETS_FILE_NAME}`, {
            method: "PUT",
            body: JSON.stringify(content),
        });
    }

    /**
     * Download presets from Google Drive via backend
     */
    async downloadPresets(): Promise<SavedPreset[]> {
        try {
            const data = await this.apiRequest(
                `/drive/files/${PRESETS_FILE_NAME}`
            );

            if (!data || !data.presets) {
                return [];
            }

            return data.presets.map((preset: any) => ({
                ...preset,
                syncId: preset.syncId || crypto.randomUUID(),
                createdAt: new Date(preset.createdAt),
                updatedAt: new Date(preset.updatedAt),
            }));
        } catch (error: any) {
            if (
                error.message?.includes("404") ||
                error.message?.includes("not found")
            ) {
                return [];
            }
            throw error;
        }
    }

    /**
     * Track a deletion locally (to be synced later)
     */
    async trackDeletion(
        type: "chat" | "preset",
        syncId: string
    ): Promise<void> {
        const stored = await chrome.storage.local.get("pendingDeletions");
        const deletions: DeletionRecord[] = stored.pendingDeletions || [];

        deletions.push({
            type,
            syncId,
            deletedAt: new Date().toISOString(),
        });

        await chrome.storage.local.set({ pendingDeletions: deletions });
    }

    /**
     * Get pending deletions from local storage
     */
    private async getPendingDeletions(): Promise<DeletionRecord[]> {
        const stored = await chrome.storage.local.get("pendingDeletions");
        return stored.pendingDeletions || [];
    }

    /**
     * Clear pending deletions after sync
     */
    private async clearPendingDeletions(): Promise<void> {
        await chrome.storage.local.remove("pendingDeletions");
    }

    /**
     * Upload deletions to Google Drive via backend
     */
    private async uploadDeletions(deletions: DeletionRecord[]): Promise<void> {
        const content = {
            deletions,
            version: "1.0",
        };

        await this.apiRequest(`/drive/files/${DELETIONS_FILE_NAME}`, {
            method: "PUT",
            body: JSON.stringify(content),
        });
    }

    /**
     * Download deletions from Google Drive via backend
     */
    private async downloadDeletions(): Promise<DeletionRecord[]> {
        try {
            const data = await this.apiRequest(
                `/drive/files/${DELETIONS_FILE_NAME}`
            );
            return data?.deletions || [];
        } catch (error: any) {
            if (
                error.message?.includes("404") ||
                error.message?.includes("not found")
            ) {
                return [];
            }
            throw error;
        }
    }

    /**
     * Sync all data (both upload and download with conflict resolution)
     */
    async syncAll(
        localChats: SavedChat[],
        localPresets: SavedPreset[]
    ): Promise<{ chats: SavedChat[]; presets: SavedPreset[] }> {
        try {
            await this.updateSyncStatus(true);

            // Get pending local deletions
            const localDeletions = await this.getPendingDeletions();

            // Download from Drive
            const driveChats = await this.downloadChats();
            const drivePresets = await this.downloadPresets();
            const driveDeletions = await this.downloadDeletions();

            // Merge deletions
            const allDeletions = this.mergeDeletions(
                localDeletions,
                driveDeletions
            );

            // Build sets of deleted IDs
            const deletedChatSyncIds = new Set(
                allDeletions
                    .filter((d) => d.type === "chat")
                    .map((d) => d.syncId)
            );
            const deletedPresetSyncIds = new Set(
                allDeletions
                    .filter((d) => d.type === "preset")
                    .map((d) => d.syncId)
            );

            // Merge data
            let mergedChats = this.mergeData(localChats, driveChats);
            let mergedPresets = this.mergeData(localPresets, drivePresets);

            // Apply deletions
            mergedChats = mergedChats.filter((chat) => {
                if (!chat.syncId) return true;
                if (!deletedChatSyncIds.has(chat.syncId)) return true;

                const deletion = allDeletions.find(
                    (d) => d.type === "chat" && d.syncId === chat.syncId
                );
                if (deletion) {
                    const deletedAt = new Date(deletion.deletedAt);
                    return chat.updatedAt > deletedAt;
                }
                return true;
            });

            mergedPresets = mergedPresets.filter((preset) => {
                if (!preset.syncId) return true;
                if (!deletedPresetSyncIds.has(preset.syncId)) return true;

                const deletion = allDeletions.find(
                    (d) => d.type === "preset" && d.syncId === preset.syncId
                );
                if (deletion) {
                    const deletedAt = new Date(deletion.deletedAt);
                    return preset.updatedAt > deletedAt;
                }
                return true;
            });

            // Upload merged data back to Drive
            await this.uploadChats(mergedChats);
            await this.uploadPresets(mergedPresets);
            await this.uploadDeletions(allDeletions);

            // Clear local pending deletions
            await this.clearPendingDeletions();

            await this.updateSyncStatus(false);
            await this.updateLastSync();

            return {
                chats: mergedChats,
                presets: mergedPresets,
            };
        } catch (error) {
            await this.updateSyncStatus(false);
            const errorMessage =
                error instanceof Error ? error.message : "Sync failed";
            await this.updateSyncError(errorMessage);
            throw error;
        }
    }

    /**
     * Merge local and remote data with conflict resolution
     */
    private mergeData<T extends { syncId: string; updatedAt: Date }>(
        local: T[],
        remote: T[]
    ): T[] {
        const merged = new Map<string, T>();

        local.forEach((item) => {
            if (item.syncId) {
                merged.set(item.syncId, item);
            }
        });

        remote.forEach((remoteItem) => {
            if (remoteItem.syncId) {
                const localItem = merged.get(remoteItem.syncId);
                if (!localItem || remoteItem.updatedAt > localItem.updatedAt) {
                    merged.set(remoteItem.syncId, remoteItem);
                }
            }
        });

        return Array.from(merged.values());
    }

    /**
     * Merge deletion records
     */
    private mergeDeletions(
        local: DeletionRecord[],
        remote: DeletionRecord[]
    ): DeletionRecord[] {
        const merged = new Map<string, DeletionRecord>();

        const key = (d: DeletionRecord) => `${d.type}-${d.syncId}`;

        [...local, ...remote].forEach((deletion) => {
            const k = key(deletion);
            const existing = merged.get(k);
            if (
                !existing ||
                new Date(deletion.deletedAt) < new Date(existing.deletedAt)
            ) {
                merged.set(k, deletion);
            }
        });

        // Clean up old deletions (older than 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return Array.from(merged.values()).filter(
            (d) => new Date(d.deletedAt) > thirtyDaysAgo
        );
    }

    /**
     * Get sync status from storage
     */
    async getSyncStatus(): Promise<SyncStatus> {
        const result = await chrome.storage.local.get("syncStatus");
        const stored = result.syncStatus;
        if (!stored) {
            return {
                enabled: false,
                lastSync: null,
                syncInProgress: false,
                error: null,
                authenticated: false,
            };
        }
        return {
            ...stored,
            lastSync: stored.lastSync ? new Date(stored.lastSync) : null,
        };
    }

    /**
     * Store sync status
     */
    private async storeSyncStatus(updates: Partial<SyncStatus>): Promise<void> {
        const currentStatus = await this.getSyncStatus();
        const newStatus = { ...currentStatus, ...updates };
        await chrome.storage.local.set({ syncStatus: newStatus });
    }

    /**
     * Update sync in progress status
     */
    private async updateSyncStatus(inProgress: boolean): Promise<void> {
        await this.storeSyncStatus({
            syncInProgress: inProgress,
            error: inProgress ? null : undefined,
        } as any);
    }

    /**
     * Update last sync time
     */
    private async updateLastSync(): Promise<void> {
        await this.storeSyncStatus({
            lastSync: new Date().toISOString() as any,
        });
    }

    /**
     * Update sync error
     */
    private async updateSyncError(error: string): Promise<void> {
        await this.storeSyncStatus({ error });
    }

    /**
     * Enable sync
     */
    async enableSync(): Promise<void> {
        await this.storeSyncStatus({ enabled: true });
    }

    /**
     * Disable sync
     */
    async disableSync(): Promise<void> {
        await this.storeSyncStatus({ enabled: false });
    }

    /**
     * Delete all data from Google Drive via backend
     */
    async deleteAllData(): Promise<void> {
        await this.apiRequest("/drive/all-data", { method: "DELETE" });
        await chrome.storage.local.remove("pendingDeletions");
    }

    /**
     * Restore data from Google Drive
     */
    async restoreFromCloud(): Promise<{
        chats: SavedChat[];
        presets: SavedPreset[];
        hasData: boolean;
    }> {
        try {
            await this.updateSyncStatus(true);

            let chats = await this.downloadChats();
            let presets = await this.downloadPresets();
            const deletions = await this.downloadDeletions();

            // Build sets of deleted IDs
            const deletedChatSyncIds = new Set(
                deletions.filter((d) => d.type === "chat").map((d) => d.syncId)
            );
            const deletedPresetSyncIds = new Set(
                deletions
                    .filter((d) => d.type === "preset")
                    .map((d) => d.syncId)
            );

            // Filter out deleted items
            chats = chats.filter((chat) => {
                if (!chat.syncId) return true;
                if (!deletedChatSyncIds.has(chat.syncId)) return true;

                const deletion = deletions.find(
                    (d) => d.type === "chat" && d.syncId === chat.syncId
                );
                if (deletion) {
                    const deletedAt = new Date(deletion.deletedAt);
                    return chat.updatedAt > deletedAt;
                }
                return true;
            });

            presets = presets.filter((preset) => {
                if (!preset.syncId) return true;
                if (!deletedPresetSyncIds.has(preset.syncId)) return true;

                const deletion = deletions.find(
                    (d) => d.type === "preset" && d.syncId === preset.syncId
                );
                if (deletion) {
                    const deletedAt = new Date(deletion.deletedAt);
                    return preset.updatedAt > deletedAt;
                }
                return true;
            });

            const hasData = chats.length > 0 || presets.length > 0;

            await this.updateSyncStatus(false);
            if (hasData) {
                await this.updateLastSync();
            }

            return { chats, presets, hasData };
        } catch (error) {
            await this.updateSyncStatus(false);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to restore from cloud";
            await this.updateSyncError(errorMessage);
            throw error;
        }
    }

    /**
     * Check if there's data in Google Drive
     */
    async hasCloudData(): Promise<boolean> {
        try {
            const data = await this.apiRequest("/drive/has-data");
            return data.hasData === true;
        } catch {
            return false;
        }
    }
}

export const googleDriveSync = new GoogleDriveSyncBackend();
