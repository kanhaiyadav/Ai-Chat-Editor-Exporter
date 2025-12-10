import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SavedChat, chatOperations } from '@/lib/settingsDB';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTheme } from '@/lib/useTheme';
import { Download, MessageSquare, AlertCircle } from 'lucide-react';

interface BulkExportChatsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

// Import source icons
import chatgpt from "@/assets/openai.svg";
import claude from "@/assets/claude.svg";
import gemini from "@/assets/gemini-fill.svg";
import deepseek from "@/assets/deepseek-fill.svg";
import chatgptLight from "@/assets/openai-light.svg";
import claudeLight from "@/assets/claude-light.svg";
import geminiLight from "@/assets/gemini-fill-light.svg";
import deepseekLight from "@/assets/deepseek-fill-light.svg";
import { useMemo } from 'react';
import { BsFiletypeJson } from "react-icons/bs";

const SourceLabels: Record<string, string> = {
    chatgpt: 'ChatGPT',
    claude: 'Claude',
    gemini: 'Gemini',
    deepseek: 'DeepSeek',
};

export const BulkExportChatsDialog = ({
    isOpen,
    onClose,
}: BulkExportChatsDialogProps) => {
    const { t } = useTranslation();
    const [selectedChats, setSelectedChats] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const { effectiveTheme } = useTheme();

    const SourceIcons: Record<string, string> = useMemo(() => ({
        chatgpt: effectiveTheme === 'dark' ? chatgptLight : chatgpt,
        claude: effectiveTheme === 'dark' ? claudeLight : claude,
        gemini: effectiveTheme === 'dark' ? geminiLight : gemini,
        deepseek: effectiveTheme === 'dark' ? deepseekLight : deepseek,
    }), [effectiveTheme]);

    const allChats = useLiveQuery(async () => {
        return await chatOperations.getAllChats();
    }, []);

    const filteredChats = (allChats || []).filter((chat) =>
        chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectChat = (chatId: number, checked: boolean) => {
        const newSelected = new Set(selectedChats);
        if (checked) {
            newSelected.add(chatId);
        } else {
            newSelected.delete(chatId);
        }
        setSelectedChats(newSelected);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedChats(new Set(filteredChats.map((c) => c.id!)));
        } else {
            setSelectedChats(new Set());
        }
    };

    const handleExport = async () => {
        if (selectedChats.size === 0) return;

        setIsExporting(true);

        try {
            const chatsToExport: SavedChat[] = [];

            for (const chatId of selectedChats) {
                const chat = await chatOperations.getChat(chatId);
                if (chat) {
                    chatsToExport.push(chat);
                }
            }

            const exportData = {
                version: 1,
                exportDate: new Date().toISOString(),
                exportType: 'bulk',
                chatCount: chatsToExport.length,
                chats: chatsToExport,
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `chats-backup-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            onClose();
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleClose = () => {
        setSelectedChats(new Set());
        setSearchTerm('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="!max-w-2xl h-[70vh] flex flex-col bg-accent">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BsFiletypeJson size={22} />
                        {t('bulkExport.title')}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                    {/* Search */}
                    <div className="p-1">
                        <Input
                            placeholder={t('bulkExport.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-9 border-black/20 dark:border-input"
                        />
                    </div>

                    {/* Select All */}
                    <div className="px-1 flex items-center gap-2 pb-2 border-b border-border">
                        <Checkbox
                            checked={selectedChats.size === filteredChats.length && filteredChats.length > 0}
                            onCheckedChange={(checked) => handleSelectAll(checked === true)}
                            className="border-black/40 dark:border-input"
                        />
                        <label className="text-sm font-medium cursor-pointer flex-1">
                            {t('bulkExport.selectAll')} ({filteredChats.length})
                        </label>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="px-1 space-y-2 pr-4">
                                {filteredChats && filteredChats.length > 0 ? (
                                    filteredChats.map((chat) => (
                                        <div
                                            key={chat.id}
                                            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <Checkbox
                                                checked={selectedChats.has(chat.id || 0)}
                                                onCheckedChange={(checked) =>
                                                    handleSelectChat(chat.id || 0, checked === true)
                                                }
                                                className="border-black/40 dark:border-input"
                                            />
                                            <img
                                                src={SourceIcons[chat.source]}
                                                alt={chat.source}
                                                className="size-5"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{chat.title}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {chat.name} • {chat.messages.length} {t('importChats.messages')}
                                                </p>
                                            </div>
                                            <span className="text-xs font-semibold bg-primary/5 ring-1 ring-primary text-primary px-2 py-1 rounded">
                                                {SourceLabels[chat.source]}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                        <MessageSquare size={32} className="opacity-30 mb-2" />
                                        <p className="text-sm font-medium">{t('bulkExport.noChats')}</p>
                                        <p className="text-xs mt-1">{t('bulkExport.noChatsMessage')}</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Info Box */}
                    {selectedChats.size > 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-2">
                            <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                {selectedChats.size} {selectedChats.size === 1 ? t('bulkExport.chatSelected') : t('bulkExport.chatsSelected')}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-border">
                    <Button variant="outline" onClick={handleClose}>
                        {t('bulkExport.cancel')}
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={selectedChats.size === 0 || isExporting}
                        className="gap-2"
                    >
                        <Download size={16} />
                        {isExporting ? t('bulkExport.exporting') : `${t('bulkExport.export')} ${selectedChats.size} ${selectedChats.size === 1 ? t('importChats.chat') : t('importChats.chats')}`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
