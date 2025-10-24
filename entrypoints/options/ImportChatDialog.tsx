import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatOperations, SavedChat } from '@/lib/settingsDB';
import { Message, ChatSource, defaultSettings } from './types';
import { Upload, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ImportChatDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess?: () => void;
}

interface ImportedChat {
    version?: number;
    exportDate?: string;
    source: ChatSource;
    chatName: string;
    chatTitle: string;
    messages: Message[];
    messageCount?: number;
    settings?: any;
}

interface BulkImportData {
    version?: number;
    exportDate?: string;
    exportType: 'bulk' | 'single';
    chats?: SavedChat[];
    chatCount?: number;
}

type ImportStep = 'initial' | 'preview' | 'importing' | 'success' | 'error';

export const ImportChatDialog = ({
    isOpen,
    onClose,
    onImportSuccess,
}: ImportChatDialogProps) => {
    const [step, setStep] = useState<ImportStep>('initial');
    const [dragActive, setDragActive] = useState(false);
    const [importedData, setImportedData] = useState<ImportedChat[] | null>(null);
    const [error, setError] = useState<string>('');
    const [importedCount, setImportedCount] = useState(0);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const parseAndValidateFile = (file: File): Promise<ImportedChat[] | BulkImportData | null> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const data = JSON.parse(content);

                    // Check if it's bulk export
                    if (data.exportType === 'bulk' && data.chats) {
                        resolve(data as BulkImportData);
                    }
                    // Check if it's single chat export (either new format with 'name' or old format with 'chatName')
                    else if (data.messages && Array.isArray(data.messages)) {
                        const singleChat: ImportedChat = {
                            chatName: data.name || data.chatName || 'Imported Chat',
                            chatTitle: data.title || data.chatTitle || '',
                            messages: data.messages,
                            source: data.source || 'chatgpt',
                            settings: data.settings,
                        };
                        resolve([singleChat]);
                    } else {
                        reject(new Error('Invalid file format. Please use a file exported from Chat2Pdf.'));
                    }
                } catch (err) {
                    reject(new Error('Failed to parse file. Make sure it is a valid JSON file.'));
                }
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file.'));
            };
            reader.readAsText(file);
        });
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            await handleFileProcessing(file);
        }
    };

    const handleFileProcessing = async (file: File) => {
        try {
            setError('');
            const data = await parseAndValidateFile(file);

            if (!data) return;

            // Handle bulk import
            if ('exportType' in data && data.exportType === 'bulk' && Array.isArray(data.chats)) {
                // Map SavedChat objects to ImportedChat format
                const mappedChats: ImportedChat[] = data.chats.map((chat: SavedChat) => ({
                    chatName: chat.name || 'Imported Chat',
                    chatTitle: chat.title || '',
                    messages: chat.messages || [],
                    source: chat.source || 'chatgpt',
                    settings: chat.settings, // Preserve original settings
                }));
                setImportedData(mappedChats);
            }
            // Handle single/multiple chats
            else if (Array.isArray(data)) {
                setImportedData(data);
            }

            setStep('preview');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
            setStep('error');
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (files && files.length > 0) {
            handleFileProcessing(files[0]);
        }
    };

    const handleImport = async () => {
        if (!importedData || importedData.length === 0) return;

        setStep('importing');
        let successCount = 0;

        try {
            for (const chatData of importedData) {
                try {
                    // Ensure source is valid
                    let source: ChatSource = 'chatgpt';
                    if (['chatgpt', 'claude', 'gemini', 'deepseek'].includes(chatData.source)) {
                        source = chatData.source as ChatSource;
                    }

                    // Get unique name
                    let chatName = chatData.chatName;
                    let counter = 1;
                    while (await chatOperations.chatNameExists(chatName)) {
                        chatName = `${chatData.chatName} (${counter})`;
                        counter++;
                    }

                    // Use original settings if available, otherwise use defaults
                    const settings = chatData.settings || defaultSettings;

                    // Save the chat
                    await chatOperations.saveChat(
                        chatName,
                        chatData.chatTitle,
                        chatData.messages,
                        source,
                        settings
                    );

                    successCount++;
                } catch (err) {
                    console.error(`Failed to import chat: ${chatData.chatName}`, err);
                    // Continue with next chat
                }
            }

            setImportedCount(successCount);
            setStep('success');

            // Auto close after 2 seconds
            setTimeout(() => {
                onImportSuccess?.();
                handleClose();
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import chats');
            setStep('error');
        }
    };

    const handleClose = () => {
        setStep('initial');
        setDragActive(false);
        setImportedData(null);
        setError('');
        setImportedCount(0);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md bg-card">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload size={20} />
                        Import Chat
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'initial' && 'Import previously exported chat backups'}
                        {step === 'preview' && `Review ${importedData?.length || 0} chat${importedData?.length !== 1 ? 's' : ''}`}
                        {step === 'importing' && 'Importing chats...'}
                        {step === 'success' && 'Import successful!'}
                        {step === 'error' && 'Import failed'}
                    </DialogDescription>
                </DialogHeader>

                {step === 'initial' && (
                    <div className="space-y-4">
                        {/* Drag and Drop Area */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-accent/10 hover:border-primary/50'
                                }`}
                        >
                            <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
                            <p className="font-medium text-sm mb-1">Drag and drop your file here</p>
                            <p className="text-xs text-muted-foreground mb-3">or</p>
                            <label>
                                <Input
                                    type="file"
                                    accept=".json,.jsonld"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="cursor-pointer"
                                >
                                    <span>Choose File</span>
                                </Button>
                            </label>
                            <p className="text-xs text-muted-foreground mt-3">
                                Accepted formats: .json, .jsonld
                            </p>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-2">
                            <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Import chat backups that you previously exported from Chat2Pdf.
                            </p>
                        </div>
                    </div>
                )}

                {step === 'preview' && importedData && (
                    <div className="space-y-4">
                        <div className="bg-accent/50 border border-border rounded-lg p-3 space-y-2 max-h-64 overflow-y-auto">
                            {importedData.map((chat, idx) => (
                                <div key={idx} className="border-b border-border/50 last:border-b-0 pb-2 last:pb-0">
                                    <p className="text-sm font-medium line-clamp-1">{chat.chatName}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{chat.chatTitle}</p>
                                    <p className="text-xs text-muted-foreground">{chat.messages.length} messages</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-2">
                            <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                {importedData.length} chat{importedData.length !== 1 ? 's' : ''} will be imported with respective settings.
                            </p>
                        </div>
                    </div>
                )}

                {step === 'importing' && (
                    <div className="py-8 space-y-4 text-center">
                        <div className="flex justify-center">
                            <div className="animate-spin">
                                <Upload size={32} className="text-primary" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Importing chats...</p>
                    </div>
                )}

                {step === 'success' && (
                    <div className="py-8 space-y-4 text-center">
                        <div className="flex justify-center">
                            <CheckCircle2 size={48} className="text-green-500" />
                        </div>
                        <div>
                            <p className="font-medium text-sm mb-1">Import Successful!</p>
                            <p className="text-xs text-muted-foreground">
                                {importedCount} chat{importedCount !== 1 ? 's' : ''} imported successfully
                            </p>
                        </div>
                    </div>
                )}

                {step === 'error' && (
                    <div className="py-8 space-y-4">
                        <div className="flex justify-center">
                            <AlertTriangle size={48} className="text-destructive" />
                        </div>
                        <div>
                            <p className="font-medium text-sm mb-1 text-center">Import Failed</p>
                            <p className="text-xs text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/20">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-2 justify-end">
                    {step === 'initial' && (
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                    )}
                    {step === 'preview' && (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleImport} className="gap-2">
                                <Upload size={16} />
                                Import Chats
                            </Button>
                        </>
                    )}
                    {(step === 'success' || step === 'error') && (
                        <Button onClick={handleClose}>
                            {step === 'success' ? 'Done' : 'Close'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
