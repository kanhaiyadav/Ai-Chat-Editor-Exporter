import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Message } from './types';
import { AlertCircle } from 'lucide-react';
import { BsFiletypeJson } from "react-icons/bs";

interface ExportChatDialogProps {
    isOpen: boolean;
    onClose: () => void;
    chatName: string;
    chatTitle: string;
    messages: Message[];
    source: string;
}

export const ExportChatDialog = ({
    isOpen,
    onClose,
    chatName,
    chatTitle,
    messages,
    source,
}: ExportChatDialogProps) => {
    const handleExportJSON = () => {
        const chatData = {
            version: 1,
            exportDate: new Date().toISOString(),
            source,
            chatName,
            chatTitle,
            messageCount: messages.length,
            messages,
        };

        const jsonString = JSON.stringify(chatData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${chatName || 'chat'}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        onClose();
    };

    const handleExportJSON_LD = () => {
        const chatData = {
            version: 1,
            exportDate: new Date().toISOString(),
            source,
            chatName,
            chatTitle,
            messageCount: messages.length,
            messages,
        };

        // Use .jsonld format for semantic web compatibility
        const jsonString = JSON.stringify(chatData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/ld+json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${chatName || 'chat'}-${Date.now()}.jsonld`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BsFiletypeJson size={24} />
                        JSON Export
                    </DialogTitle>
                    <DialogDescription>
                        Choose export format for your chat
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-accent/50 border border-border shadow-sm rounded-lg p-3 space-y-2">
                        <p className="text-sm font-medium">{chatName}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{chatTitle}</p>
                        <p className="text-xs text-muted-foreground">{messages.length} messages</p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Export Format</h4>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleExportJSON}
                                className="flex-1 [&_svg:not([class*='size-'])]:size-5"
                                variant="outline"
                            >
                                JSON Format (.json)
                            </Button>
                            <Button
                                onClick={handleExportJSON_LD}
                                className="flex-1 [&_svg:not([class*='size-'])]:size-5"
                                variant="outline"
                            >
                                JSON-LD Format (.jsonld)
                            </Button>
                        </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-2">
                        <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            Your exported chat can be imported later using the Import feature.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
