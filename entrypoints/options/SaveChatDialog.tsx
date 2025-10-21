import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Message, PDFSettings, ChatSource } from './types';
import { chatOperations } from '@/lib/settingsDB';

interface SaveChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    chatTitle: string;
    messages: Message[];
    chatSource: ChatSource;
    currentSettings: PDFSettings;
    currentChatId: number | null;
    onChatCreated?: (chatId: number) => void;
}

export const SaveChatDialog = ({
    open,
    onOpenChange,
    chatTitle,
    messages,
    chatSource,
    currentSettings,
    currentChatId,
    onChatCreated,
}: SaveChatDialogProps) => {
    const [chatName, setChatName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            if (currentChatId !== null) {
                // For Save As from existing chat, suggest a new name
                setChatName(`${chatTitle} (Copy)`);
            } else {
                // For new chat, use title
                setChatName(chatTitle);
            }
            setError('');
        }
    }, [open, chatTitle, currentChatId]);

    const handleSaveChat = async () => {
        if (!chatName.trim()) {
            setError('Please enter a chat name');
            return;
        }

        setSaving(true);
        setError('');

        try {
            // Check if name already exists
            const exists = await chatOperations.chatNameExists(chatName.trim(), currentChatId || undefined);
            if (exists) {
                setError('A chat with this name already exists');
                setSaving(false);
                return;
            }

            // Always create new chat (Save As)
            const newChatId = await chatOperations.saveChat(
                chatName.trim(),
                chatTitle,
                messages,
                chatSource,
                currentSettings
            );

            // Notify parent component of the new chat ID
            if (onChatCreated && newChatId) {
                onChatCreated(newChatId);
            }

            // Reset and close
            setChatName('');
            setError('');
            onOpenChange(false);
        } catch (err) {
            setError('Failed to save chat');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <DialogTitle>Save Chat As</DialogTitle>
                    <DialogDescription>
                        Save this chat with the current settings. The chat will include all messages and PDF export settings.
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='chat-name'>Chat Name</Label>
                        <Input
                            id='chat-name'
                            placeholder='Enter a name for this chat...'
                            value={chatName}
                            onChange={(e) => {
                                setChatName(e.target.value);
                                setError('');
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSaveChat();
                                }
                            }}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <p className='text-sm text-destructive'>{error}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant='outline'
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSaveChat} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className='mr-2 h-4 w-4' />
                                Save Chat
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
