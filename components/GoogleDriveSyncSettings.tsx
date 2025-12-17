import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Cloud, CloudOff, RefreshCw, Trash2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { googleDriveSync, SyncStatus } from "@/lib/googleDriveSync";
import { chatOperations, presetOperations } from "@/lib/settingsDB";
import { useToast } from "@/hooks/use-toast";

export function GoogleDriveSyncSettings() {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        enabled: false,
        lastSync: null,
        syncInProgress: false,
        error: null,
        authenticated: false,
    });
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadSyncStatus();

        // Listen for storage changes
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
        } finally {
            setLoading(false);
        }
    };

    const handleAuthenticate = async () => {
        setLoading(true);
        try {
            const success = await googleDriveSync.authenticate();
            if (success) {
                toast({
                    title: "Connected!",
                    description: "Checking for existing data in Google Drive...",
                });

                // After successful authentication, restore data from cloud
                try {
                    const { chats, presets, hasData } = await googleDriveSync.restoreFromCloud();

                    if (hasData) {
                        // Save restored data to local database
                        for (const chat of chats) {
                            // Check if chat already exists locally by syncId
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
                                // Add new chat with its syncId preserved
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
                                // Add new preset with its syncId preserved
                                await presetOperations.savePresetWithSyncId(
                                    preset.syncId,
                                    preset.name,
                                    preset.settings
                                );
                            }
                        }

                        toast({
                            title: "Data Restored!",
                            description: `Restored ${chats.length} chats and ${presets.length} presets from Google Drive.`,
                        });
                    } else {
                        toast({
                            title: "Connected!",
                            description: "No existing data found in Google Drive. Your new data will be synced.",
                        });
                    }
                } catch (restoreError) {
                    console.error("Failed to restore data:", restoreError);
                    toast({
                        title: "Connected (with warning)",
                        description: "Connected to Google Drive but couldn't restore data. Try 'Sync Now' manually.",
                        variant: "destructive",
                    });
                }

                await loadSyncStatus();
            } else {
                toast({
                    title: "Connection Failed",
                    description: "Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Authentication error:", error);
            toast({
                title: "Connection Error",
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await googleDriveSync.signOut();
            toast({
                title: "Disconnected",
                description: "You have been disconnected from Google Drive.",
            });
            await loadSyncStatus();
        } catch (error) {
            console.error("Sign out error:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSync = async (enabled: boolean) => {
        try {
            if (enabled) {
                await googleDriveSync.enableSync();
                toast({
                    title: "Auto-Sync Enabled",
                    description: "Your data will automatically sync with Google Drive.",
                });
            } else {
                await googleDriveSync.disableSync();
                toast({
                    title: "Auto-Sync Disabled",
                    description: "Automatic sync has been turned off.",
                });
            }
            await loadSyncStatus();
        } catch (error) {
            console.error("Toggle sync error:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to toggle sync",
                variant: "destructive",
            });
        }
    };

    const handleManualSync = async () => {
        setLoading(true);
        try {
            const localChats = await chatOperations.getAllChats();
            const localPresets = await presetOperations.getAllPresets();

            const { chats, presets } = await googleDriveSync.syncAll(
                localChats,
                localPresets
            );

            // Update local database with merged data
            // First, get current local data to match by syncId
            const currentLocalChats = await chatOperations.getAllChats();
            const currentLocalPresets = await presetOperations.getAllPresets();

            // Build maps for quick lookup
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

            // Delete local items that are not in merged results (they were deleted elsewhere)
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
                title: "Sync Completed",
                description: `Synced ${chats.length} chats and ${presets.length} presets.`,
            });
            await loadSyncStatus();
        } catch (error) {
            console.error("Manual sync error:", error);
            toast({
                title: "Sync Failed",
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCloudData = async () => {
        if (!confirm("Are you sure you want to delete all data from Google Drive? This action cannot be undone.")) {
            return;
        }

        setLoading(true);
        try {
            await googleDriveSync.deleteAllData();
            toast({
                title: "Cloud Data Deleted",
                description: "All data has been removed from Google Drive.",
            });
        } catch (error) {
            console.error("Delete cloud data error:", error);
            toast({
                title: "Delete Failed",
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !syncStatus.authenticated) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        Google Drive Sync
                    </CardTitle>
                    <CardDescription>
                        Loading sync settings...
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                    <Spinner className="h-8 w-8" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {syncStatus.authenticated ? (
                        <Cloud className="h-5 w-5 text-green-600" />
                    ) : (
                        <CloudOff className="h-5 w-5 text-gray-400" />
                    )}
                    Google Drive Sync
                </CardTitle>
                <CardDescription>
                    Sync your chats and presets across devices using your Google Drive
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Connection Status */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base font-semibold">
                                Connection Status
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {syncStatus.authenticated
                                    ? "Connected to Google Drive"
                                    : "Not connected"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {syncStatus.authenticated ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                                <XCircle className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                    </div>

                    {!syncStatus.authenticated ? (
                        <Button
                            onClick={handleAuthenticate}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Cloud className="mr-2 h-4 w-4" />
                                    Connect to Google Drive
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSignOut}
                            disabled={loading}
                            variant="outline"
                            className="w-full"
                        >
                            <CloudOff className="mr-2 h-4 w-4" />
                            Disconnect
                        </Button>
                    )}
                </div>

                {syncStatus.authenticated && (
                    <>
                        {/* Auto Sync Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="enable-sync" className="text-base font-semibold">
                                    Auto Sync
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Automatically sync changes to Google Drive
                                </p>
                            </div>
                            <Switch
                                id="enable-sync"
                                checked={syncStatus.enabled}
                                onCheckedChange={handleToggleSync}
                                disabled={loading || syncStatus.syncInProgress}
                            />
                        </div>

                        {/* Last Sync Time */}
                        {syncStatus.lastSync && (
                            <div className="rounded-lg border p-3">
                                <p className="text-sm font-medium">Last Sync</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(syncStatus.lastSync).toLocaleString()}
                                </p>
                            </div>
                        )}

                        {/* Error Display */}
                        {syncStatus.error && (
                            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-destructive">
                                            Sync Error
                                        </p>
                                        <p className="text-sm text-destructive/90">
                                            {syncStatus.error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Manual Sync Button */}
                        <Button
                            onClick={handleManualSync}
                            disabled={loading || syncStatus.syncInProgress}
                            variant="outline"
                            className="w-full"
                        >
                            {syncStatus.syncInProgress ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Sync Now
                                </>
                            )}
                        </Button>

                        {/* Delete Cloud Data */}
                        <div className="pt-4 border-t">
                            <Button
                                onClick={handleDeleteCloudData}
                                disabled={loading || syncStatus.syncInProgress}
                                variant="destructive"
                                className="w-full"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Cloud Data
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                This will delete all synced data from Google Drive
                            </p>
                        </div>
                    </>
                )}

                {/* Info Box */}
                <div className="rounded-lg bg-muted p-4 space-y-2">
                    <p className="text-sm font-medium">How it works</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Your data is stored in your personal Google Drive</li>
                        <li>All data is encrypted by Google Drive</li>
                        <li>No data is stored on our servers</li>
                        <li>Sync across all your browsers and devices</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
