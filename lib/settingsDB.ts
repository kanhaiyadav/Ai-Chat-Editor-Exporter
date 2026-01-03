import Dexie, { Table } from "dexie";
import { PDFSettings, Message, ChatSource } from "@/entrypoints/options/types";

// Generate a UUID for sync identification across devices
export function generateSyncId(): string {
    return crypto.randomUUID();
}

export interface SavedPreset {
    id?: number;
    syncId: string; // UUID for cross-device sync identification
    name: string;
    settings: PDFSettings;
    createdAt: Date;
    updatedAt: Date;
}

export interface SavedChat {
    id?: number;
    syncId: string; // UUID for cross-device sync identification
    name: string;
    title: string;
    messages: Message[];
    source: ChatSource; // Source of the chat (chatgpt, claude, gemini, deepseek)
    settings: PDFSettings; // Store the full settings preset
    createdAt: Date;
    updatedAt: Date;
}

export class SettingsDatabase extends Dexie {
    presets!: Table<SavedPreset, number>;
    chats!: Table<SavedChat, number>;

    constructor() {
        super("PDFSettingsDB");
        this.version(1).stores({
            presets: "++id, name, createdAt, updatedAt",
        });
        // Add version 2 to include chats table
        this.version(2).stores({
            presets: "++id, name, createdAt, updatedAt",
            chats: "++id, name, createdAt, updatedAt",
        });
        // Add version 3 to include source field in chats
        this.version(3).stores({
            presets: "++id, name, createdAt, updatedAt",
            chats: "++id, name, source, createdAt, updatedAt",
        });
        // Add version 4 to store full settings in chats instead of presetId
        this.version(4).stores({
            presets: "++id, name, createdAt, updatedAt",
            chats: "++id, name, source, createdAt, updatedAt",
        });
        // Add version 5 to include syncId for cross-device sync
        this.version(5)
            .stores({
                presets: "++id, syncId, name, createdAt, updatedAt",
                chats: "++id, syncId, name, source, createdAt, updatedAt",
            })
            .upgrade(async (tx) => {
                // Migrate existing presets - add syncId
                await tx
                    .table("presets")
                    .toCollection()
                    .modify((preset: any) => {
                        if (!preset.syncId) {
                            preset.syncId = crypto.randomUUID();
                        }
                    });
                // Migrate existing chats - add syncId
                await tx
                    .table("chats")
                    .toCollection()
                    .modify((chat: any) => {
                        if (!chat.syncId) {
                            chat.syncId = crypto.randomUUID();
                        }
                    });
            });
    }
}

export const db = new SettingsDatabase();

// Utility functions for preset management
export const presetOperations = {
    // Save a new preset
    async savePreset(name: string, settings: PDFSettings): Promise<number> {
        const now = new Date();
        const id = await db.presets.add({
            syncId: generateSyncId(),
            name,
            settings,
            createdAt: now,
            updatedAt: now,
        });

        // Trigger auto-sync
        triggerAutoSync();

        return id;
    },

    // Get all presets
    async getAllPresets(): Promise<SavedPreset[]> {
        return await db.presets.orderBy("updatedAt").reverse().toArray();
    },

    // Get a preset by ID
    async getPreset(id: number): Promise<SavedPreset | undefined> {
        return await db.presets.get(id);
    },

    // Update an existing preset
    async updatePreset(
        id: number,
        name: string,
        settings: PDFSettings
    ): Promise<void> {
        await db.presets.update(id, {
            name,
            settings,
            updatedAt: new Date(),
        });

        // Trigger auto-sync
        triggerAutoSync();
    },

    // Delete a preset
    async deletePreset(id: number): Promise<void> {
        // Get syncId before deletion for tracking
        const preset = await db.presets.get(id);
        await db.presets.delete(id);

        // Track deletion for sync using syncId
        if (preset?.syncId) {
            trackDeletion("preset", preset.syncId);
        }

        // Trigger auto-sync
        triggerAutoSync();
    },

    // Delete a preset without tracking (used during sync)
    async deletePresetWithoutTracking(id: number): Promise<void> {
        await db.presets.delete(id);
    },

    // Save a preset with a specific syncId (used during sync/restore)
    async savePresetWithSyncId(
        syncId: string,
        name: string,
        settings: PDFSettings
    ): Promise<number> {
        const now = new Date();
        const id = await db.presets.add({
            syncId,
            name,
            settings,
            createdAt: now,
            updatedAt: now,
        });
        return id;
    },

    // Check if a preset name exists
    async presetNameExists(name: string, excludeId?: number): Promise<boolean> {
        const presets = await db.presets.where("name").equals(name).toArray();
        if (excludeId) {
            return presets.some((p) => p.id !== excludeId);
        }
        return presets.length > 0;
    },

    // Duplicate a preset
    async duplicatePreset(id: number, newName: string): Promise<number> {
        const preset = await db.presets.get(id);
        if (!preset) {
            throw new Error("Preset not found");
        }
        return await this.savePreset(newName, preset.settings);
    },
};

// Helper function to track deletions for sync
async function trackDeletion(type: "chat" | "preset", syncId: string) {
    try {
        const { googleDriveSync } = await import("./googleDriveSyncBackend");
        await googleDriveSync.trackDeletion(type, syncId);
    } catch (error) {
        console.error("Failed to track deletion:", error);
    }
}

// Helper function to trigger sync if enabled
async function triggerAutoSync() {
    try {
        const { googleDriveSync } = await import("./googleDriveSyncBackend");
        const syncStatus = await googleDriveSync.getSyncStatus();

        if (
            syncStatus.enabled &&
            syncStatus.authenticated &&
            !syncStatus.syncInProgress
        ) {
            // Trigger sync in background
            const chats = await chatOperations.getAllChats();
            const presets = await presetOperations.getAllPresets();
            googleDriveSync.syncAll(chats, presets).catch(console.error);
        }
    } catch (error) {
        console.error("Auto-sync error:", error);
    }
}

export const chatOperations = {
    // Save a new chat
    async saveChat(
        name: string,
        title: string,
        messages: Message[],
        source: ChatSource,
        settings: PDFSettings
    ): Promise<number> {
        const now = new Date();
        const id = await db.chats.add({
            syncId: generateSyncId(),
            name,
            title,
            messages,
            source,
            settings,
            createdAt: now,
            updatedAt: now,
        });

        // Trigger auto-sync
        triggerAutoSync();

        return id;
    },

    // Get all chats
    async getAllChats(): Promise<SavedChat[]> {
        return await db.chats.orderBy("updatedAt").reverse().toArray();
    },

    // Get a chat by ID
    async getChat(id: number): Promise<SavedChat | undefined> {
        return await db.chats.get(id);
    },

    // Update an existing chat
    async updateChat(
        id: number,
        name: string,
        title: string,
        messages: Message[],
        source: ChatSource,
        settings: PDFSettings
    ): Promise<void> {
        await db.chats.update(id, {
            name,
            title,
            messages,
            source,
            settings,
            updatedAt: new Date(),
        });

        // Trigger auto-sync
        triggerAutoSync();
    },

    // Delete a chat
    async deleteChat(id: number): Promise<void> {
        // Get syncId before deletion for tracking
        const chat = await db.chats.get(id);
        await db.chats.delete(id);

        // Track deletion for sync using syncId
        if (chat?.syncId) {
            trackDeletion("chat", chat.syncId);
        }

        // Trigger auto-sync
        triggerAutoSync();
    },

    // Delete a chat without tracking (used during sync)
    async deleteChatWithoutTracking(id: number): Promise<void> {
        await db.chats.delete(id);
    },

    // Save a chat with a specific syncId (used during sync/restore)
    async saveChatWithSyncId(
        syncId: string,
        name: string,
        title: string,
        messages: Message[],
        source: ChatSource,
        settings: PDFSettings
    ): Promise<number> {
        const now = new Date();
        const id = await db.chats.add({
            syncId,
            name,
            title,
            messages,
            source,
            settings,
            createdAt: now,
            updatedAt: now,
        });
        return id;
    },

    // Check if a chat name exists
    async chatNameExists(name: string, excludeId?: number): Promise<boolean> {
        const chats = await db.chats.where("name").equals(name).toArray();
        if (excludeId) {
            return chats.some((c) => c.id !== excludeId);
        }
        return chats.length > 0;
    },

    // Duplicate a chat
    async duplicateChat(id: number, newName: string): Promise<number> {
        const chat = await db.chats.get(id);
        if (!chat) {
            throw new Error("Chat not found");
        }
        return await this.saveChat(
            newName,
            chat.title,
            chat.messages,
            chat.source,
            chat.settings
        );
    },

    // Get chats by source
    async getChatsBySource(source: ChatSource): Promise<SavedChat[]> {
        return await db.chats
            .where("source")
            .equals(source)
            .reverse()
            .sortBy("updatedAt");
    },
};
