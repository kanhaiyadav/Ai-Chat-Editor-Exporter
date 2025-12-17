/**
 * Google Drive Sync Service - Universal Version
 *
 * This service handles syncing chats and presets to Google Drive.
 * Uses launchWebAuthFlow() which works in ALL Chromium browsers
 * (Chrome, Brave, Edge, Opera, etc.)
 */

import { SavedChat, SavedPreset } from "./settingsDB";

export interface SyncStatus {
    enabled: boolean;
    lastSync: Date | null;
    syncInProgress: boolean;
    error: string | null;
    authenticated: boolean;
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

interface TokenData {
    access_token: string;
    refresh_token?: string;
    expires_at: number;
}

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3";
const APP_FOLDER_NAME = "ExportMyChat_Data";
const CHATS_FILE_NAME = "chats.json";
const PRESETS_FILE_NAME = "presets.json";
const DELETIONS_FILE_NAME = "deletions.json";

// Interface for tracking deletions
interface DeletionRecord {
    type: "chat" | "preset";
    syncId: string; // UUID of the deleted item
    deletedAt: string; // ISO string
}

interface DeletionsData {
    deletions: DeletionRecord[];
    version: string;
}

// OAuth Configuration
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.appdata",
].join(" ");

// Built-in OAuth credentials (bundled at build time from .env)
const BUILT_IN_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const BUILT_IN_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "";

class GoogleDriveSync {
    private accessToken: string | null = null;
    private appFolderId: string | null = null;
    private clientId: string = BUILT_IN_CLIENT_ID;
    private clientSecret: string = BUILT_IN_CLIENT_SECRET;

    constructor() {
        // Credentials are now built-in, no need to load from storage
    }

    /**
     * Check if credentials are configured (built-in)
     */
    async hasCredentials(): Promise<boolean> {
        return !!(this.clientId && this.clientSecret);
    }

    /**
     * Get the redirect URL for this extension
     */
    getRedirectUrl(): string {
        return chrome.identity.getRedirectURL();
    }

    /**
     * Check if user is authenticated with Google
     */
    async isAuthenticated(): Promise<boolean> {
        const token = await this.getAccessToken();
        return token !== null;
    }

    /**
     * Authenticate with Google using launchWebAuthFlow (works in ALL browsers)
     */
    async authenticate(): Promise<boolean> {
        try {
            if (!this.clientId || !this.clientSecret) {
                await this.updateSyncError(
                    "OAuth credentials not configured. Please contact the extension developer."
                );
                return false;
            }

            const redirectUrl = this.getRedirectUrl();
            console.log("Redirect URL for OAuth:", redirectUrl);

            // Build authorization URL
            const authParams = new URLSearchParams({
                client_id: this.clientId,
                redirect_uri: redirectUrl,
                response_type: "code",
                scope: SCOPES,
                access_type: "offline",
                prompt: "consent",
            });

            const authUrl = `${GOOGLE_AUTH_URL}?${authParams.toString()}`;

            // Launch the OAuth flow
            const responseUrl = await new Promise<string>((resolve, reject) => {
                chrome.identity.launchWebAuthFlow(
                    {
                        url: authUrl,
                        interactive: true,
                    },
                    (responseUrl) => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                            return;
                        }
                        if (!responseUrl) {
                            reject(new Error("No response URL received"));
                            return;
                        }
                        resolve(responseUrl);
                    }
                );
            });

            // Extract authorization code from response URL
            const url = new URL(responseUrl);
            const code = url.searchParams.get("code");
            const error = url.searchParams.get("error");

            if (error) {
                throw new Error(`OAuth error: ${error}`);
            }

            if (!code) {
                throw new Error("No authorization code received");
            }

            // Exchange code for tokens
            const tokens = await this.exchangeCodeForTokens(code, redirectUrl);

            // Store tokens
            await this.storeTokens(tokens);
            this.accessToken = tokens.access_token;

            await this.storeSyncStatus({ authenticated: true, error: null });
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
     * Exchange authorization code for access tokens
     */
    private async exchangeCodeForTokens(
        code: string,
        redirectUri: string
    ): Promise<TokenData> {
        const response = await fetch(GOOGLE_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code: code,
                grant_type: "authorization_code",
                redirect_uri: redirectUri,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Token exchange failed:", errorText);
            throw new Error(`Token exchange failed: ${response.status}`);
        }

        const data = await response.json();

        return {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Date.now() + data.expires_in * 1000,
        };
    }

    /**
     * Refresh the access token using refresh token
     */
    private async refreshAccessToken(): Promise<boolean> {
        try {
            const stored = await chrome.storage.local.get("oauth_tokens");
            const tokens: TokenData | null = stored.oauth_tokens;

            if (!tokens?.refresh_token) {
                return false;
            }

            const response = await fetch(GOOGLE_TOKEN_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    refresh_token: tokens.refresh_token,
                    grant_type: "refresh_token",
                }),
            });

            if (!response.ok) {
                console.error("Token refresh failed");
                return false;
            }

            const data = await response.json();

            const newTokens: TokenData = {
                access_token: data.access_token,
                refresh_token: tokens.refresh_token, // Keep existing refresh token
                expires_at: Date.now() + data.expires_in * 1000,
            };

            await this.storeTokens(newTokens);
            this.accessToken = newTokens.access_token;

            return true;
        } catch (error) {
            console.error("Error refreshing token:", error);
            return false;
        }
    }

    /**
     * Store tokens securely
     */
    private async storeTokens(tokens: TokenData): Promise<void> {
        await chrome.storage.local.set({ oauth_tokens: tokens });
    }

    /**
     * Get stored tokens
     */
    private async getStoredTokens(): Promise<TokenData | null> {
        const result = await chrome.storage.local.get("oauth_tokens");
        return result.oauth_tokens || null;
    }

    /**
     * Clear stored tokens
     */
    private async clearTokens(): Promise<void> {
        await chrome.storage.local.remove("oauth_tokens");
    }

    /**
     * Sign out from Google
     */
    async signOut(): Promise<void> {
        // Revoke the token if we have one
        if (this.accessToken) {
            try {
                await fetch(
                    `https://oauth2.googleapis.com/revoke?token=${this.accessToken}`,
                    { method: "POST" }
                );
            } catch (e) {
                // Ignore revocation errors
            }
        }

        this.accessToken = null;
        this.appFolderId = null;
        await this.clearTokens();
        await this.storeSyncStatus({ authenticated: false, enabled: false });
    }

    /**
     * Get valid access token (refreshing if needed)
     */
    private async getAccessToken(): Promise<string | null> {
        // Return cached token if valid
        if (this.accessToken) {
            const tokens = await this.getStoredTokens();
            if (tokens && tokens.expires_at > Date.now() + 60000) {
                // 1 min buffer
                return this.accessToken;
            }
        }

        // Try to get from storage
        const tokens = await this.getStoredTokens();
        if (!tokens) {
            return null;
        }

        // Check if token is expired or about to expire
        if (tokens.expires_at <= Date.now() + 60000) {
            // Token expired, try to refresh
            const refreshed = await this.refreshAccessToken();
            if (!refreshed) {
                // Refresh failed, user needs to re-authenticate
                await this.storeSyncStatus({ authenticated: false });
                return null;
            }
        } else {
            this.accessToken = tokens.access_token;
        }

        return this.accessToken;
    }

    /**
     * Get or create the app folder in Google Drive
     */
    private async getOrCreateAppFolder(): Promise<string> {
        if (this.appFolderId) {
            return this.appFolderId;
        }

        const token = await this.getAccessToken();
        if (!token) {
            throw new Error("Not authenticated");
        }

        // Search for existing folder
        const searchResponse = await fetch(
            `${DRIVE_API_BASE}/files?q=name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!searchResponse.ok) {
            throw new Error("Failed to search for app folder");
        }

        const searchData = await searchResponse.json();

        if (searchData.files && searchData.files.length > 0) {
            this.appFolderId = searchData.files[0].id;
            return this.appFolderId!;
        }

        // Create folder if it doesn't exist
        const createResponse = await fetch(`${DRIVE_API_BASE}/files`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: APP_FOLDER_NAME,
                mimeType: "application/vnd.google-apps.folder",
            }),
        });

        if (!createResponse.ok) {
            throw new Error("Failed to create app folder");
        }

        const createData = await createResponse.json();
        this.appFolderId = createData.id;
        return this.appFolderId!;
    }

    /**
     * Find a file by name in the app folder
     */
    private async findFile(fileName: string): Promise<DriveFile | null> {
        const token = await this.getAccessToken();
        if (!token) {
            throw new Error("Not authenticated");
        }

        const folderId = await this.getOrCreateAppFolder();

        const response = await fetch(
            `${DRIVE_API_BASE}/files?q=name='${fileName}' and '${folderId}' in parents and trashed=false&fields=files(id,name,modifiedTime)`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to find file: ${fileName}`);
        }

        const data = await response.json();

        if (data.files && data.files.length > 0) {
            return data.files[0];
        }

        return null;
    }

    /**
     * Upload or update a file in Google Drive
     */
    private async uploadFile(
        fileName: string,
        content: string,
        existingFileId?: string
    ): Promise<string> {
        const token = await this.getAccessToken();
        if (!token) {
            throw new Error("Not authenticated");
        }

        const folderId = await this.getOrCreateAppFolder();

        const metadata = {
            name: fileName,
            mimeType: "application/json",
            ...(existingFileId ? {} : { parents: [folderId] }),
        };

        const boundary = "-------314159265358979323846";
        const delimiter = "\r\n--" + boundary + "\r\n";
        const closeDelim = "\r\n--" + boundary + "--";

        const multipartRequestBody =
            delimiter +
            "Content-Type: application/json\r\n\r\n" +
            JSON.stringify(metadata) +
            delimiter +
            "Content-Type: application/json\r\n\r\n" +
            content +
            closeDelim;

        const url = existingFileId
            ? `${DRIVE_UPLOAD_BASE}/files/${existingFileId}?uploadType=multipart`
            : `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`;

        const response = await fetch(url, {
            method: existingFileId ? "PATCH" : "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": `multipart/related; boundary=${boundary}`,
            },
            body: multipartRequestBody,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to upload file: ${errorText}`);
        }

        const data = await response.json();
        return data.id;
    }

    /**
     * Download file content from Google Drive
     */
    private async downloadFile(fileId: string): Promise<string> {
        const token = await this.getAccessToken();
        if (!token) {
            throw new Error("Not authenticated");
        }

        const response = await fetch(
            `${DRIVE_API_BASE}/files/${fileId}?alt=media`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to download file");
        }

        return await response.text();
    }

    /**
     * Upload chats to Google Drive
     */
    async uploadChats(chats: SavedChat[]): Promise<void> {
        const existingFile = await this.findFile(CHATS_FILE_NAME);
        const content = JSON.stringify(
            {
                chats: chats.map((chat) => ({
                    ...chat,
                    syncId: chat.syncId, // Ensure syncId is included
                    createdAt: chat.createdAt.toISOString(),
                    updatedAt: chat.updatedAt.toISOString(),
                })),
                version: "2.0", // Bumped version for syncId support
                lastModified: new Date().toISOString(),
            },
            null,
            2
        );

        await this.uploadFile(CHATS_FILE_NAME, content, existingFile?.id);
    }

    /**
     * Download chats from Google Drive
     */
    async downloadChats(): Promise<SavedChat[]> {
        const file = await this.findFile(CHATS_FILE_NAME);
        if (!file) {
            return [];
        }

        const content = await this.downloadFile(file.id);
        const data = JSON.parse(content);

        return data.chats.map((chat: any) => ({
            ...chat,
            // Generate syncId for old data that doesn't have it
            syncId: chat.syncId || crypto.randomUUID(),
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt),
        }));
    }

    /**
     * Upload presets to Google Drive
     */
    async uploadPresets(presets: SavedPreset[]): Promise<void> {
        const existingFile = await this.findFile(PRESETS_FILE_NAME);
        const content = JSON.stringify(
            {
                presets: presets.map((preset) => ({
                    ...preset,
                    syncId: preset.syncId, // Ensure syncId is included
                    createdAt: preset.createdAt.toISOString(),
                    updatedAt: preset.updatedAt.toISOString(),
                })),
                version: "2.0", // Bumped version for syncId support
                lastModified: new Date().toISOString(),
            },
            null,
            2
        );

        await this.uploadFile(PRESETS_FILE_NAME, content, existingFile?.id);
    }

    /**
     * Download presets from Google Drive
     */
    async downloadPresets(): Promise<SavedPreset[]> {
        const file = await this.findFile(PRESETS_FILE_NAME);
        if (!file) {
            return [];
        }

        const content = await this.downloadFile(file.id);
        const data = JSON.parse(content);

        return data.presets.map((preset: any) => ({
            ...preset,
            // Generate syncId for old data that doesn't have it
            syncId: preset.syncId || crypto.randomUUID(),
            createdAt: new Date(preset.createdAt),
            updatedAt: new Date(preset.updatedAt),
        }));
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

        // Add new deletion record
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
     * Upload deletions to Google Drive
     */
    private async uploadDeletions(deletions: DeletionRecord[]): Promise<void> {
        const existingFile = await this.findFile(DELETIONS_FILE_NAME);
        const content = JSON.stringify(
            {
                deletions,
                version: "1.0",
            },
            null,
            2
        );

        await this.uploadFile(DELETIONS_FILE_NAME, content, existingFile?.id);
    }

    /**
     * Download deletions from Google Drive
     */
    private async downloadDeletions(): Promise<DeletionRecord[]> {
        const file = await this.findFile(DELETIONS_FILE_NAME);
        if (!file) {
            return [];
        }

        const content = await this.downloadFile(file.id);
        const data: DeletionsData = JSON.parse(content);
        return data.deletions || [];
    }

    /**
     * Sync all data (both upload and download with conflict resolution)
     * Now includes deletion sync!
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

            // Merge deletions (combine local and remote)
            const allDeletions = this.mergeDeletions(
                localDeletions,
                driveDeletions
            );

            // Build sets of deleted IDs for quick lookup
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

            // Merge data (using updatedAt for conflict resolution)
            // Then filter out deleted items
            let mergedChats = this.mergeData(localChats, driveChats);
            let mergedPresets = this.mergeData(localPresets, drivePresets);

            // Apply deletions - remove items that were deleted
            mergedChats = mergedChats.filter((chat) => {
                if (!chat.syncId) return true;
                if (!deletedChatSyncIds.has(chat.syncId)) return true;

                // Check if the deletion happened after the last update
                const deletion = allDeletions.find(
                    (d) => d.type === "chat" && d.syncId === chat.syncId
                );
                if (deletion) {
                    const deletedAt = new Date(deletion.deletedAt);
                    return chat.updatedAt > deletedAt; // Keep if updated after deletion
                }
                return true;
            });

            mergedPresets = mergedPresets.filter((preset) => {
                if (!preset.syncId) return true;
                if (!deletedPresetSyncIds.has(preset.syncId)) return true;

                // Check if the deletion happened after the last update
                const deletion = allDeletions.find(
                    (d) => d.type === "preset" && d.syncId === preset.syncId
                );
                if (deletion) {
                    const deletedAt = new Date(deletion.deletedAt);
                    return preset.updatedAt > deletedAt; // Keep if updated after deletion
                }
                return true;
            });

            // Upload merged data back to Drive
            await this.uploadChats(mergedChats);
            await this.uploadPresets(mergedPresets);
            await this.uploadDeletions(allDeletions);

            // Clear local pending deletions (they're now synced)
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
     * Strategy: Keep the most recently updated item
     * Uses syncId (UUID) for unique identification across devices
     */
    private mergeData<T extends { syncId: string; updatedAt: Date }>(
        local: T[],
        remote: T[]
    ): T[] {
        const merged = new Map<string, T>();

        // Add all local items
        local.forEach((item) => {
            if (item.syncId) {
                merged.set(item.syncId, item);
            }
        });

        // Add or update with remote items (prefer newer updatedAt)
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
     * Merge deletion records from local and remote
     * Keep unique deletions, prefer the earliest deletion time
     */
    private mergeDeletions(
        local: DeletionRecord[],
        remote: DeletionRecord[]
    ): DeletionRecord[] {
        const merged = new Map<string, DeletionRecord>();

        // Helper to create unique key
        const key = (d: DeletionRecord) => `${d.type}-${d.syncId}`;

        // Add all deletions, keeping the earliest deletion time
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

        // Clean up old deletions (older than 30 days) to prevent unbounded growth
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
            // Parse lastSync from ISO string back to Date
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
        // Store as ISO string for proper JSON serialization
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
     * Delete all data from Google Drive
     */
    async deleteAllData(): Promise<void> {
        const token = await this.getAccessToken();
        if (!token) {
            throw new Error("Not authenticated");
        }

        const chatsFile = await this.findFile(CHATS_FILE_NAME);
        const presetsFile = await this.findFile(PRESETS_FILE_NAME);
        const deletionsFile = await this.findFile(DELETIONS_FILE_NAME);

        if (chatsFile) {
            await fetch(`${DRIVE_API_BASE}/files/${chatsFile.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }

        if (presetsFile) {
            await fetch(`${DRIVE_API_BASE}/files/${presetsFile.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }

        if (deletionsFile) {
            await fetch(`${DRIVE_API_BASE}/files/${deletionsFile.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }

        // Also clear local pending deletions
        await this.clearPendingDeletions();
    }

    /**
     * Restore data from Google Drive (download only, no upload)
     * Used when reconnecting to an existing account or on fresh install
     * Respects deletion records to avoid restoring deleted items
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

                // Check if deletion happened after last update
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
            const chatsFile = await this.findFile(CHATS_FILE_NAME);
            const presetsFile = await this.findFile(PRESETS_FILE_NAME);
            return !!(chatsFile || presetsFile);
        } catch {
            return false;
        }
    }
}

export const googleDriveSync = new GoogleDriveSync();
