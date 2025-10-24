import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Database, Trash2, Copy, Pencil, Check, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card } from '@/components/ui/card';
import { Message, PDFSettings } from './types';
import { SavedChat, chatOperations, presetOperations, db } from '@/lib/settingsDB';

interface SavedChatsManagementProps {
    isExpanded: boolean;
    onToggle: () => void;
    onLoadChat: (chat: SavedChat, preset: PDFSettings | null) => void;
}

export const SavedChatsManagement = ({
    isExpanded,
    onToggle,
    onLoadChat,
}: SavedChatsManagementProps) => {
    // Use useLiveQuery for automatic refresh
    const chats = useLiveQuery(
        () => db.chats.orderBy('updatedAt').reverse().toArray(),
        []
    );

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [error, setError] = useState('');

    const handleLoadChat = async (chat: SavedChat) => {
        // Chat stores full settings directly, so use that
        onLoadChat(chat, chat.settings);
    };

    const handleDeleteChat = async (id: number) => {
        if (confirm('Are you sure you want to delete this saved chat?')) {
            await chatOperations.deleteChat(id);
            // No need to call loadChats() - useLiveQuery will auto-refresh
        }
    };

    const handleStartEdit = (chat: SavedChat) => {
        setEditingId(chat.id!);
        setEditingName(chat.name);
        setError('');
    };

    const handleSaveEdit = async (id: number) => {
        if (!editingName.trim()) {
            setError('Chat name cannot be empty');
            return;
        }

        const exists = await chatOperations.chatNameExists(editingName.trim(), id);
        if (exists) {
            setError('A chat with this name already exists');
            return;
        }

        const chat = chats?.find(c => c.id === id);
        if (chat) {
            await chatOperations.updateChat(
                id,
                editingName.trim(),
                chat.title,
                chat.messages,
                chat.source,
                chat.settings
            );
            setEditingId(null);
            setEditingName('');
            setError('');
            // No need to call loadChats() - useLiveQuery will auto-refresh
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName('');
        setError('');
    };

    const handleDuplicateChat = async (chat: SavedChat) => {
        let baseName = `${chat.name} (Copy)`;
        let newName = baseName;
        let counter = 1;

        while (await chatOperations.chatNameExists(newName)) {
            newName = `${baseName} ${counter}`;
            counter++;
        }

        await chatOperations.duplicateChat(chat.id!, newName);
        // No need to call loadChats() - useLiveQuery will auto-refresh
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
        <Collapsible open={isExpanded} onOpenChange={onToggle}>
            <Card className='border border-border/40 bg-card/50 shadow-sm'>
                <CollapsibleTrigger className='flex w-full items-center justify-between p-4 hover:bg-accent/50 transition-colors rounded-t-lg'>
                    <div className='flex items-center gap-2'>
                        <Database className='h-4 w-4' />
                        <span className='font-medium'>Saved Chats</span>
                    </div>
                    <span className='text-xs text-muted-foreground'>
                        {chats?.length || 0} saved
                    </span>
                </CollapsibleTrigger>

                <CollapsibleContent className='px-4 pb-4 space-y-4'>
                    {chats && chats.length > 0 ? (
                        <div className='space-y-2 pt-2'>
                            <Label className='text-sm font-medium'>Your Saved Chats</Label>
                            <div className='space-y-2 max-h-80 overflow-y-auto pr-1'>
                                {chats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className='group flex items-center gap-2 p-3 rounded-md bg-accent/30 hover:bg-accent/60 transition-colors border border-border/20'
                                    >
                                        {editingId === chat.id ? (
                                            <>
                                                <Input
                                                    value={editingName}
                                                    onChange={(e) => {
                                                        setEditingName(e.target.value);
                                                        setError('');
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleSaveEdit(chat.id!);
                                                        } else if (e.key === 'Escape') {
                                                            handleCancelEdit();
                                                        }
                                                    }}
                                                    className='flex-1 h-8'
                                                    autoFocus
                                                />
                                                <Button
                                                    onClick={() => handleSaveEdit(chat.id!)}
                                                    variant='ghost'
                                                    size='sm'
                                                    className='h-8 w-8 p-0'
                                                >
                                                    <Check className='h-4 w-4 text-green-600' />
                                                </Button>
                                                <Button
                                                    onClick={handleCancelEdit}
                                                    variant='ghost'
                                                    size='sm'
                                                    className='h-8 w-8 p-0'
                                                >
                                                    <X className='h-4 w-4 text-red-600' />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <div
                                                    className='flex-1 cursor-pointer'
                                                    onClick={() => handleLoadChat(chat)}
                                                >
                                                    <p className='text-sm font-medium'>
                                                        {chat.name}
                                                    </p>
                                                    <p className='text-xs text-muted-foreground'>
                                                        {chat.title}
                                                    </p>
                                                    <div className='flex items-center gap-2 mt-1'>
                                                        <span className='text-xs text-muted-foreground capitalize'>
                                                            {chat.source}
                                                        </span>
                                                        <span className='text-xs text-muted-foreground'>
                                                            • {chat.messages.length} messages
                                                        </span>
                                                    </div>
                                                    <p className='text-xs text-muted-foreground mt-0.5'>
                                                        Updated: {formatDate(chat.updatedAt)}
                                                    </p>
                                                </div>
                                                <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                                    <Button
                                                        onClick={() => handleStartEdit(chat)}
                                                        variant='ghost'
                                                        size='sm'
                                                        className='h-8 w-8 p-0'
                                                        title='Rename'
                                                    >
                                                        <Pencil className='h-3.5 w-3.5' />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDuplicateChat(chat)}
                                                        variant='ghost'
                                                        size='sm'
                                                        className='h-8 w-8 p-0'
                                                        title='Duplicate'
                                                    >
                                                        <Copy className='h-3.5 w-3.5' />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDeleteChat(chat.id!)}
                                                        variant='ghost'
                                                        size='sm'
                                                        className='h-8 w-8 p-0 hover:text-destructive'
                                                        title='Delete'
                                                    >
                                                        <Trash2 className='h-3.5 w-3.5' />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {error && (
                                <p className='text-xs text-destructive mt-2'>{error}</p>
                            )}
                        </div>
                    ) : (
                        <div className='text-center py-8 text-sm text-muted-foreground'>
                            <Database className='h-12 w-12 mx-auto mb-2 opacity-50' />
                            <p>No saved chats yet</p>
                            <p className='text-xs mt-1'>
                                Click "Save Chat" to save your conversations for later
                            </p>
                        </div>
                    )}
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
