import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Cloud, CloudOff, RefreshCw, Trash2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { googleDriveSync, SyncStatus } from "@/lib/googleDriveSync";
import { chatOperations, presetOperations } from "@/lib/settingsDB";
import { useToast } from "@/hooks/use-toast";

interface GoogleDriveSyncModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    syncStatus: SyncStatus;
    onSyncStatusChange: () => void;
}

export function GoogleDriveSyncModal({
    open,
    onOpenChange,
    syncStatus,
    onSyncStatusChange,
}: GoogleDriveSyncModalProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { t } = useTranslation();

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await googleDriveSync.signOut();
            toast({
                title: t('googleDriveSync.toasts.disconnected'),
                description: t('googleDriveSync.toasts.disconnectedDesc'),
            });
            onSyncStatusChange();
            onOpenChange(false);
        } catch (error) {
            console.error("Sign out error:", error);
            toast({
                title: t('googleDriveSync.toasts.error'),
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
                    title: t('googleDriveSync.toasts.autoSyncEnabled'),
                    description: t('googleDriveSync.toasts.autoSyncEnabledDesc'),
                });
            } else {
                await googleDriveSync.disableSync();
                toast({
                    title: t('googleDriveSync.toasts.autoSyncDisabled'),
                    description: t('googleDriveSync.toasts.autoSyncDisabledDesc'),
                });
            }
            onSyncStatusChange();
        } catch (error) {
            console.error("Toggle sync error:", error);
            toast({
                title: t('googleDriveSync.toasts.error'),
                description: error instanceof Error ? error.message : t('googleDriveSync.toasts.toggleError'),
                variant: "destructive",
            });
        }
    };

    const handleDeleteCloudData = async () => {
        if (!confirm(t('googleDriveSync.deleteConfirm'))) {
            return;
        }

        setLoading(true);
        try {
            await googleDriveSync.deleteAllData();
            toast({
                title: t('googleDriveSync.toasts.cloudDataDeleted'),
                description: t('googleDriveSync.toasts.cloudDataDeletedDesc'),
            });
            onSyncStatusChange();
        } catch (error) {
            console.error("Delete cloud data error:", error);
            toast({
                title: t('googleDriveSync.toasts.deleteFailed'),
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <img src="/gdrive.svg" alt="" className="w-5 h-5"/>
                        {t('googleDriveSync.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('googleDriveSync.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Connection Status */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base font-semibold">
                                {t('googleDriveSync.connectionStatus')}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {t('googleDriveSync.connected')}
                            </p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>

                    {/* Auto Sync Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="enable-sync-modal" className="text-base font-semibold">
                                {t('googleDriveSync.autoSync')}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {t('googleDriveSync.autoSyncDesc')}
                            </p>
                        </div>
                        <Switch
                            id="enable-sync-modal"
                            checked={syncStatus.enabled}
                            onCheckedChange={handleToggleSync}
                            disabled={loading || syncStatus.syncInProgress}
                        />
                    </div>

                    {/* Last Sync Time */}
                    {syncStatus.lastSync && (
                        <div className="rounded-lg border p-3">
                            <p className="text-sm font-medium">{t('googleDriveSync.lastSync')}</p>
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
                                        {t('googleDriveSync.syncError')}
                                    </p>
                                    <p className="text-sm text-destructive/90">
                                        {syncStatus.error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Disconnect Button */}
                    <Button
                        onClick={handleSignOut}
                        disabled={loading}
                        variant="outline"
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Spinner className="mr-2 h-4 w-4" />
                                {t('googleDriveSync.disconnecting')}
                            </>
                        ) : (
                            <>
                                <CloudOff className="mr-2 h-4 w-4" />
                                {t('googleDriveSync.disconnect')}
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
                            {t('googleDriveSync.deleteCloudData')}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            {t('googleDriveSync.deleteCloudDataDesc')}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
