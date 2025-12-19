"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
    AudioWaveform,
    Command,
    Frame,
    GalleryVerticalEnd,
    Map as MapIcon,
    MoreVertical,
    PieChart,
    RefreshCcw,
} from "lucide-react"

import { NavChats } from "./nav-chats"
import { NavPresets } from "./nav-presets"
import { ToggleSidebar } from "./team-switcher"
import { BuyMeCoffeeModal } from "@/components/BuyMeCoffeeModal"
import { GoogleDriveSyncModal } from "@/components/GoogleDriveSyncModal"
import { ConfirmationDialog } from "./ConfirmationDialog"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarRail,
} from "@/components/ui/sidebar"
import chatgpt from "@/assets/openai.svg";
import claude from "@/assets/claude.svg";
import gemini from "@/assets/gemini-fill.svg";
import deepseek from "@/assets/deepseek-fill.svg";
import chatgptLight from "@/assets/openai-light.svg";
import claudeLight from "@/assets/claude-light.svg";
import geminiLight from "@/assets/gemini-fill-light.svg";
import deepseekLight from "@/assets/deepseek-fill-light.svg";
import { useLiveQuery } from "dexie-react-hooks"
import { chatOperations, db, presetOperations, SavedChat, SavedPreset } from "@/lib/settingsDB"
import { PDFSettings } from "./types"
import { useTheme } from "@/lib/useTheme"
import { SiBuymeacoffee } from "react-icons/si"
import { FaGithub, FaStar } from "react-icons/fa6"
import {
    ButtonGroup,
} from "@/components/ui/button-group"
import { BsFiletypeJson } from "react-icons/bs";
import { BsFileEarmarkArrowDown } from "react-icons/bs";
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { Spinner } from "@/components/ui/spinner"
import { googleDriveSync, SyncStatus } from "@/lib/googleDriveSync"
import { useToast } from "@/hooks/use-toast"
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator';


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    onLoadChat: (chat: SavedChat, preset: PDFSettings | null) => void;
    onLoadPreset: (preset: SavedPreset) => void;
    onOpenBulkExport?: () => void;
    onOpenImport?: () => void;
    closeChat: () => void;
}

export function AppSidebar({ onLoadChat, onLoadPreset, onOpenBulkExport, onOpenImport, closeChat, ...props }: AppSidebarProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [buyMeCoffeeOpen, setBuyMeCoffeeOpen] = React.useState(false)
    const [syncSettingsOpen, setSyncSettingsOpen] = React.useState(false)
    const [syncStatus, setSyncStatus] = React.useState<SyncStatus>({
        enabled: false,
        lastSync: null,
        syncInProgress: false,
        error: null,
        authenticated: false,
    })
    const [syncLoading, setSyncLoading] = React.useState(false)

    // Load sync status on mount and listen for changes
    useEffect(() => {
        loadSyncStatus();

        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.syncStatus) {
                setSyncStatus(changes.syncStatus.newValue);
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);

    const loadSyncStatus = async () => {
        try {
            const status = await googleDriveSync.getSyncStatus();
            setSyncStatus(status);
        } catch (error) {
            console.error("Failed to load sync status:", error);
        }
    };

    const handleConnectGoogleDrive = async () => {
        setSyncLoading(true);
        try {
            const success = await googleDriveSync.authenticate();
            if (success) {
                toast({
                    title: t('googleDriveSync.toasts.connected'),
                    description: t('googleDriveSync.toasts.checkingData'),
                });

                // After successful authentication, restore data from cloud
                try {
                    const { chats, presets, hasData } = await googleDriveSync.restoreFromCloud();

                    if (hasData) {
                        // Save restored data to local database
                        for (const chat of chats) {
                            const existingChats = await chatOperations.getAllChats();
                            const existingChat = existingChats.find(c => c.syncId === chat.syncId);

                            if (existingChat) {
                                await chatOperations.updateChat(
                                    existingChat.id!,
                                    chat.name,
                                    chat.title,
                                    chat.messages,
                                    chat.source,
                                    chat.settings
                                );
                            } else {
                                await chatOperations.saveChatWithSyncId(
                                    chat.syncId,
                                    chat.name,
                                    chat.title,
                                    chat.messages,
                                    chat.source,
                                    chat.settings
                                );
                            }
                        }

                        for (const preset of presets) {
                            const existingPresets = await presetOperations.getAllPresets();
                            const existingPreset = existingPresets.find(p => p.syncId === preset.syncId);

                            if (existingPreset) {
                                await presetOperations.updatePreset(
                                    existingPreset.id!,
                                    preset.name,
                                    preset.settings
                                );
                            } else {
                                await presetOperations.savePresetWithSyncId(
                                    preset.syncId,
                                    preset.name,
                                    preset.settings
                                );
                            }
                        }

                        toast({
                            title: t('googleDriveSync.toasts.dataRestored'),
                            description: t('googleDriveSync.toasts.restoredCount', { chats: chats.length, presets: presets.length }),
                        });
                    } else {
                        toast({
                            title: t('googleDriveSync.toasts.connected'),
                            description: t('googleDriveSync.toasts.noDataFound'),
                        });
                    }
                } catch (restoreError) {
                    console.error("Failed to restore data:", restoreError);
                    toast({
                        title: t('googleDriveSync.toasts.connectedWarning'),
                        description: t('googleDriveSync.toasts.couldNotRestore'),
                        variant: "destructive",
                    });
                }

                await loadSyncStatus();
            } else {
                toast({
                    title: t('googleDriveSync.toasts.connectionFailed'),
                    description: t('googleDriveSync.toasts.tryAgain'),
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Authentication error:", error);
            toast({
                title: t('googleDriveSync.toasts.connectionError'),
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive",
            });
        } finally {
            setSyncLoading(false);
        }
    };

    const handleManualSync = async () => {
        setSyncLoading(true);
        try {
            const localChats = await chatOperations.getAllChats();
            const localPresets = await presetOperations.getAllPresets();

            const { chats, presets } = await googleDriveSync.syncAll(
                localChats,
                localPresets
            );

            // Update local database with merged data
            const currentLocalChats = await chatOperations.getAllChats();
            const currentLocalPresets = await presetOperations.getAllPresets();

            const localChatBySyncId = new Map(currentLocalChats.map(c => [c.syncId, c]));
            const localPresetBySyncId = new Map(currentLocalPresets.map(p => [p.syncId, p]));

            // Update or add chats
            for (const chat of chats) {
                const existingChat = localChatBySyncId.get(chat.syncId);
                if (existingChat) {
                    await chatOperations.updateChat(
                        existingChat.id!,
                        chat.name,
                        chat.title,
                        chat.messages,
                        chat.source,
                        chat.settings
                    );
                } else {
                    await chatOperations.saveChatWithSyncId(
                        chat.syncId,
                        chat.name,
                        chat.title,
                        chat.messages,
                        chat.source,
                        chat.settings
                    );
                }
            }

            // Update or add presets
            for (const preset of presets) {
                const existingPreset = localPresetBySyncId.get(preset.syncId);
                if (existingPreset) {
                    await presetOperations.updatePreset(
                        existingPreset.id!,
                        preset.name,
                        preset.settings
                    );
                } else {
                    await presetOperations.savePresetWithSyncId(
                        preset.syncId,
                        preset.name,
                        preset.settings
                    );
                }
            }

            // Delete local items that are not in merged results
            for (const localChat of currentLocalChats) {
                if (!chats.find(c => c.syncId === localChat.syncId)) {
                    await chatOperations.deleteChatWithoutTracking(localChat.id!);
                }
            }

            for (const localPreset of currentLocalPresets) {
                if (!presets.find(p => p.syncId === localPreset.syncId)) {
                    await presetOperations.deletePresetWithoutTracking(localPreset.id!);
                }
            }

            toast({
                title: t('googleDriveSync.toasts.syncCompleted'),
                description: t('googleDriveSync.toasts.syncedCount', { chats: chats.length, presets: presets.length }),
            });
            await loadSyncStatus();
        } catch (error) {
            console.error("Manual sync error:", error);
            toast({
                title: t('googleDriveSync.toasts.syncFailed'),
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive",
            });
        } finally {
            setSyncLoading(false);
        }
    };

    const chats = useLiveQuery(
        () => db.chats.orderBy('updatedAt').reverse().toArray(),
        []
    );

    const presets = useLiveQuery(
        () => db.presets.orderBy('updatedAt').reverse().toArray(),
        []
    );

    const { effectiveTheme } = useTheme();

    const data = {
        user: {
            name: "shadcn",
            email: "m@example.com",
            avatar: "/avatars/shadcn.jpg",
        },
        teams: [
            {
                name: "Acme Inc",
                logo: GalleryVerticalEnd,
                plan: "Enterprise",
            },
            {
                name: "Acme Corp.",
                logo: AudioWaveform,
                plan: "Startup",
            },
            {
                name: "Evil Corp.",
                logo: Command,
                plan: "Free",
            },
        ],
        settingPresets: [
            {
                name: "Design Engineering",
                url: "#",
                icon: Frame,
            },
            {
                name: "Sales & Marketing",
                url: "#",
                icon: PieChart,
            },
            {
                name: "Travel",
                url: "#",
                icon: MapIcon,
            },
        ],
    }


    const [editingChatId, setEditingChatId] = useState<number | null>(null);
    const [editingChatName, setEditingChatName] = useState('');
    const [editingPresetId, setEditingPresetId] = useState<number | null>(null);
    const [editingPresetName, setEditingPresetName] = useState('');
    const [error, setError] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [pendingDeleteChatId, setPendingDeleteChatId] = useState<number | null>(null);
    const [deletePresetConfirmOpen, setDeletePresetConfirmOpen] = useState(false);
    const [pendingDeletePresetId, setPendingDeletePresetId] = useState<number | null>(null);

    // Source icons mapping
    const sourceIcons: Record<string, string> = React.useMemo(() => ({
        chatgpt: effectiveTheme !== 'light' ? chatgptLight : chatgpt,
        claude: effectiveTheme !== 'light' ? claudeLight : claude,
        gemini: effectiveTheme !== 'light' ? geminiLight : gemini,
        deepseek: effectiveTheme !== 'light' ? deepseekLight : deepseek,
    }), [effectiveTheme]);


    // Group chats by source
    const chatsBySource = React.useMemo(() => {
        const grouped: Record<string, SavedChat[]> = {
            chatgpt: [],
            claude: [],
            gemini: [],
            deepseek: [],
        };

        chats?.forEach((chat) => {
            if (grouped[chat.source]) {
                grouped[chat.source].push(chat);
            }
        });

        return grouped;
    }, [chats]);

    // Chat handlers
    const handleLoadChat = async (chat: SavedChat) => {
        // Use the stored settings from the chat
        onLoadChat(chat, chat.settings);
    };

    const handleDeleteChat = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setPendingDeleteChatId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteChat = async () => {
        if (pendingDeleteChatId !== null) {
            closeChat();
            await chatOperations.deleteChat(pendingDeleteChatId);
            setPendingDeleteChatId(null);
        }
        setDeleteConfirmOpen(false);
    };

    const handleStartEditChat = (chat: SavedChat, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingChatId(chat.id!);
        setEditingChatName(chat.name);
        setError('');
    };

    const handleSaveEditChat = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!editingChatName.trim()) {
            setError('Chat name cannot be empty');
            return;
        }

        const exists = await chatOperations.chatNameExists(editingChatName.trim(), id);
        if (exists) {
            setError('A chat with this name already exists');
            return;
        }

        const chat = chats?.find(c => c.id === id);
        if (chat) {
            await chatOperations.updateChat(
                id,
                editingChatName.trim(),
                chat.title,
                chat.messages,
                chat.source,
                chat.settings
            );
            setEditingChatId(null);
            setEditingChatName('');
            setError('');
        }
    };

    const handleCancelEditChat = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingChatId(null);
        setEditingChatName('');
        setError('');
    };

    const handleDuplicateChat = async (chat: SavedChat, e: React.MouseEvent) => {
        e.stopPropagation();
        let baseName = `${chat.name} (Copy)`;
        let newName = baseName;
        let counter = 1;

        while (await chatOperations.chatNameExists(newName)) {
            newName = `${baseName} ${counter}`;
            counter++;
        }

        await chatOperations.duplicateChat(chat.id!, newName);
    };

    // Preset handlers
    const handleLoadPreset = (preset: SavedPreset, e: React.MouseEvent) => {
        e.stopPropagation();
        onLoadPreset(preset);
    };

    const handleDeletePreset = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setPendingDeletePresetId(id);
        setDeletePresetConfirmOpen(true);
    };

    const confirmDeletePreset = async () => {
        if (pendingDeletePresetId !== null) {
            await presetOperations.deletePreset(pendingDeletePresetId);
            setPendingDeletePresetId(null);
        }
        setDeletePresetConfirmOpen(false);
    };

    const handleStartEditPreset = (preset: SavedPreset, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingPresetId(preset.id!);
        setEditingPresetName(preset.name);
        setError('');
    };

    const handleSaveEditPreset = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!editingPresetName.trim()) {
            setError('Preset name cannot be empty');
            return;
        }

        const exists = await presetOperations.presetNameExists(editingPresetName.trim(), id);
        if (exists) {
            setError('A preset with this name already exists');
            return;
        }

        const preset = presets?.find(p => p.id === id);
        if (preset) {
            await presetOperations.updatePreset(id, editingPresetName.trim(), preset.settings);
            setEditingPresetId(null);
            setEditingPresetName('');
            setError('');
        }
    };

    const handleCancelEditPreset = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingPresetId(null);
        setEditingPresetName('');
        setError('');
    };

    const handleDuplicatePreset = async (preset: SavedPreset, e: React.MouseEvent) => {
        e.stopPropagation();
        let baseName = `${preset.name} (Copy)`;
        let newName = baseName;
        let counter = 1;

        while (await presetOperations.presetNameExists(newName)) {
            newName = `${baseName} ${counter}`;
            counter++;
        }

        await presetOperations.duplicatePreset(preset.id!, newName);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Sidebar collapsible="icon" {...props} className={effectiveTheme === 'light' ? 'h-full !border-t-[3px] !border-t-[#bbbbbb] dark:border-0' : 'h-full'}>
                <SidebarHeader className="flex flex-row">
                    <ToggleSidebar teams={data.teams} />
                    <div className="group-data-[collapsible=icon]:hidden">
                        <SyncStatusIndicator />
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <NavChats
                        chats={chats || []}
                        chatsBySource={chatsBySource}
                        sourceIcons={sourceIcons}
                        handleLoadChat={handleLoadChat}
                        editingChatId={editingChatId}
                        editingChatName={editingChatName}
                        setEditingChatName={setEditingChatName}
                        handleStartEditChat={handleStartEditChat}
                        handleSaveEditChat={handleSaveEditChat}
                        handleCancelEditChat={handleCancelEditChat}
                        handleDeleteChat={handleDeleteChat}
                        handleDuplicateChat={handleDuplicateChat}
                        formatDate={formatDate}
                        error={error}
                    />
                    <NavPresets
                        presets={presets || []}
                        handleLoadPreset={handleLoadPreset}
                        editingPresetId={editingPresetId}
                        editingPresetName={editingPresetName}
                        setEditingPresetName={setEditingPresetName}
                        handleStartEditPreset={handleStartEditPreset}
                        handleSaveEditPreset={handleSaveEditPreset}
                        handleCancelEditPreset={handleCancelEditPreset}
                        setError={setError}
                        error={error}
                        formatDate={formatDate}
                        handleDeletePreset={handleDeletePreset}
                        handleDuplicatePreset={handleDuplicatePreset}
                    />
                </SidebarContent>
                <SidebarFooter>
                    <SidebarGroup className="group-data-[collapsible=icon]:hidden mb-[-10px]">
                        <SidebarGroupLabel>{t('sidebar.backupImport')}</SidebarGroupLabel>
                        <SidebarMenu>
                            <Button
                                variant={'outline'}
                                onClick={onOpenBulkExport}
                                className="flex-1 [&_svg:not([class*='size-'])]:size-5 overflow-hidden"
                                title={t('sidebar.backupChats')}
                            >
                                <BsFiletypeJson className="flex-shrink-0" />
                                <span className="font-semibold truncate">{t('sidebar.backupChats')}</span>
                            </Button>
                            <Button
                                onClick={onOpenImport}
                                variant={'outline'}
                                className="flex-1 [&_svg:not([class*='size-'])]:size-5"
                                title={t('sidebar.importChats')}
                            >
                                <BsFileEarmarkArrowDown />
                                <span className="font-semibold">{t('sidebar.importChats')}</span>
                            </Button>
                        </SidebarMenu>
                    </SidebarGroup>

                    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                        <div className="flex items-center justify-between">
                            <SidebarGroupLabel>{t('sidebar.cloudSync')}</SidebarGroupLabel>
                            {/* Info Icon with Tooltip */}
                            <div className="flex items-center justify-center pt-2">
                                <div className="group/tip relative inline-block">
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center w-4 h-4 rounded-full dark:bg-muted bg-black/5 shadow-sm hover:bg-muted/80 transition-colors relative top-[-3px] cursor-help"
                                        aria-label="How it works"
                                    >
                                        <span className="text-xs font-medium text-muted-foreground">?</span>
                                    </button>

                                    {/* Tooltip */}
                                    <div className="invisible group-hover/tip:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-popover border rounded-lg shadow-lg p-4 space-y-2 z-50">
                                        <p className="text-sm font-medium">{t('googleDriveSync.howItWorks')}</p>
                                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                            <li>{t('googleDriveSync.howItWorksItems.stored')}</li>
                                            <li>{t('googleDriveSync.howItWorksItems.encrypted')}</li>
                                            <li>{t('googleDriveSync.howItWorksItems.noServers')}</li>
                                            <li>{t('googleDriveSync.howItWorksItems.syncAcross')}</li>
                                        </ul>
                                        {/* Arrow */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                            <div className="border-8 border-transparent border-t-popover"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <SidebarMenu>
                            {!syncStatus.authenticated ? (
                                <ButtonGroup className="w-full">
                                    <Button
                                        variant="outline"
                                        className="[&_svg:not([class*='size-'])]:size-5 flex-1"
                                        size={'lg'}
                                        title={t('googleDriveSync.connectButton')}
                                        onClick={handleConnectGoogleDrive}
                                        disabled={syncLoading}
                                    >
                                        {syncLoading ? (
                                            <>
                                                <Spinner className="h-4 w-4" />
                                                <span>{t('googleDriveSync.connecting')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <img src="/gdrive.svg" alt="" className="w-5" />
                                                <span>{t('googleDriveSync.connectButton')}</span>
                                            </>
                                        )}
                                    </Button>
                                </ButtonGroup>
                            ) : (
                                <ButtonGroup className="w-full flex">
                                    <Button
                                        variant="outline"
                                        className="[&_svg:not([class*='size-'])]:size-[18px] flex-1 max-w-[77%]"
                                        size={'lg'}
                                        title={t('googleDriveSync.syncNow')}
                                        onClick={handleManualSync}
                                        disabled={syncLoading || syncStatus.syncInProgress}
                                    >
                                        {syncLoading || syncStatus.syncInProgress ? (
                                            <>
                                                <Spinner className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">{t('googleDriveSync.syncing')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCcw className="mt-1 flex-shrink-0" />
                                                <span className="truncate">{t('googleDriveSync.syncNow')}</span>
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="[&_svg:not([class*='size-'])]:size-5"
                                        size={'lg'}
                                        title={t('googleDriveSync.syncSettings')}
                                        onClick={() => setSyncSettingsOpen(true)}
                                    >
                                        <MoreVertical size={16} />
                                    </Button>
                                </ButtonGroup>
                            )}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>

            <GoogleDriveSyncModal
                open={syncSettingsOpen}
                onOpenChange={setSyncSettingsOpen}
                syncStatus={syncStatus}
                onSyncStatusChange={loadSyncStatus}
            />

            <ConfirmationDialog
                open={deleteConfirmOpen}
                title="Delete Chat"
                description="Are you sure you want to delete this saved chat? This action cannot be undone."
                confirmLabel="Delete"
                destructive
                onConfirm={confirmDeleteChat}
                onCancel={() => {
                    setDeleteConfirmOpen(false);
                    setPendingDeleteChatId(null);
                }}
            />

            <ConfirmationDialog
                open={deletePresetConfirmOpen}
                title="Delete Preset"
                description="Are you sure you want to delete this preset? This action cannot be undone."
                confirmLabel="Delete"
                destructive
                onConfirm={confirmDeletePreset}
                onCancel={() => {
                    setDeletePresetConfirmOpen(false);
                    setPendingDeletePresetId(null);
                }}
            />
        </>
    )
}
