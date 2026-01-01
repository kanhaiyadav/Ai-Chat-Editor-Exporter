import { useEffect, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { BsCloudCheck } from "react-icons/bs";
import { googleDriveSync, SyncStatus } from "@/lib/googleDriveSyncBackend";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function SyncStatusIndicator() {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        enabled: false,
        lastSync: null,
        syncInProgress: false,
        error: null,
        authenticated: false,
    });

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
        }
    };

    if (!syncStatus.enabled || !syncStatus.authenticated) {
        return null;
    }

    const getStatusIcon = () => {
        if (syncStatus.syncInProgress) {
            return <RefreshCw className="h-5 w-5 animate-spin dark:text-blue-500 text-blue-600" />;
        }
        if (syncStatus.error) {
            return <CloudOff className="h-6 w-6 dark:text-red-500 text-red-600" />;
        }
        return <BsCloudCheck className="h-6 w-6 dark:text-green-500 text-green-600" />;
    };

    const getStatusText = () => {
        if (syncStatus.syncInProgress) {
            return "Syncing with Google Drive...";
        }
        if (syncStatus.error) {
            return `Sync error: ${syncStatus.error}`;
        }
        if (syncStatus.lastSync) {
            const lastSyncDate = new Date(syncStatus.lastSync);
            const now = new Date();
            const diffMs = now.getTime() - lastSyncDate.getTime();
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins < 1) {
                return "Synced just now";
            } else if (diffMins < 60) {
                return `Synced ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
            } else {
                const diffHours = Math.floor(diffMins / 60);
                return `Synced ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            }
        }
        return "Connected to Google Drive";
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="p-3 rounded-md cursor-help">
                        {getStatusIcon()}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-sm">{getStatusText()}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
