import Dexie, { Table } from "dexie";
import { PDFSettings, Message } from "@/entrypoints/options/types";

export interface SavedPreset {
    id?: number;
    name: string;
    settings: PDFSettings;
    createdAt: Date;
    updatedAt: Date;
}

export interface SavedChat {
    id?: number;
    name: string;
    title: string;
    messages: Message[];
    presetId: number | null; // null means "Current Settings"
    presetName: string; // For display purposes
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
    }
}

export const db = new SettingsDatabase();

// Utility functions for preset management
export const presetOperations = {
    // Save a new preset
    async savePreset(name: string, settings: PDFSettings): Promise<number> {
        const now = new Date();
        return await db.presets.add({
            name,
            settings,
            createdAt: now,
            updatedAt: now,
        });
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
    },

    // Delete a preset
    async deletePreset(id: number): Promise<void> {
        await db.presets.delete(id);
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

// Utility functions for chat management
export const chatOperations = {
    // Save a new chat
    async saveChat(
        name: string,
        title: string,
        messages: Message[],
        presetId: number | null,
        presetName: string
    ): Promise<number> {
        const now = new Date();
        return await db.chats.add({
            name,
            title,
            messages,
            presetId,
            presetName,
            createdAt: now,
            updatedAt: now,
        });
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
        presetId: number | null,
        presetName: string
    ): Promise<void> {
        await db.chats.update(id, {
            name,
            title,
            messages,
            presetId,
            presetName,
            updatedAt: new Date(),
        });
    },

    // Delete a chat
    async deleteChat(id: number): Promise<void> {
        await db.chats.delete(id);
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
            chat.presetId,
            chat.presetName
        );
    },
};
