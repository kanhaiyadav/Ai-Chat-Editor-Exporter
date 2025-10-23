import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
    MessageSquare,
    Settings2,
    Trash2,
    Copy,
    Pencil,
    Check,
    X,
    Star,
    Github,
    MessageCircle,
    Coffee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { PDFSettings } from './types';
import { SavedChat, SavedPreset, chatOperations, presetOperations, db } from '@/lib/settingsDB';
import { BuyMeCoffeeModal } from '@/components/BuyMeCoffeeModal';
import { FeedbackModal } from '@/components/FeedbackModal';

interface LeftSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadChat: (chat: SavedChat, preset: PDFSettings | null) => void;
    onLoadPreset: (settings: PDFSettings, presetId: number) => void;
}

export const LeftSidebar = ({
    isOpen,
    onClose,
    onLoadChat,
    onLoadPreset,
}: LeftSidebarProps) => {
    const chats = useLiveQuery(
        () => db.chats.orderBy('updatedAt').reverse().toArray(),
        []
    );

    const presets = useLiveQuery(
        () => db.presets.orderBy('updatedAt').reverse().toArray(),
        []
    );

    const [editingChatId, setEditingChatId] = useState<number | null>(null);
    const [editingChatName, setEditingChatName] = useState('');
    const [editingPresetId, setEditingPresetId] = useState<number | null>(null);
    const [editingPresetName, setEditingPresetName] = useState('');
    const [error, setError] = useState('');
    const [showBuyMeCoffee, setShowBuyMeCoffee] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    // Chat handlers
    const handleLoadChat = (chat: SavedChat) => {
        onLoadChat(chat, chat.settings);
        onClose();
    };

    const handleDeleteChat = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this saved chat?')) {
            await chatOperations.deleteChat(id);
        }
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
        onLoadPreset(preset.settings, preset.id!);
    };

    const handleDeletePreset = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this preset?')) {
            await presetOperations.deletePreset(id);
        }
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

    const handleStarRepo = () => {
        window.open('https://github.com/kanhaiyadav/Ai-Chat-Editor-Exporter', '_blank');
    };

    if (!isOpen) return null;

    return (
        <>

            {/* Sidebar */}
            <Sidebar className='border-none'>
                <SidebarHeader className='border-b px-4 py-3'>
                    <div className='flex items-center justify-between'>
                        <h2 className='text-lg font-semibold'>Library</h2>
                        <Button
                            onClick={onClose}
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                        >
                            <X className='h-4 w-4' />
                        </Button>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    {/* Saved Chats Section */}
                    <SidebarGroup>
                        <SidebarGroupLabel className='flex items-center gap-2 text-base'>
                            <MessageSquare className='h-4 w-4' />
                            Saved Chats
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <ScrollArea className='h-[300px]'>
                                {chats && chats.length > 0 ? (
                                    <div className='space-y-1 px-2'>
                                        {chats.map((chat) => (
                                            <div
                                                key={chat.id}
                                                className='group rounded-lg border border-border bg-card p-3 hover:bg-accent/50 transition-colors cursor-pointer'
                                                onClick={() => handleLoadChat(chat)}
                                            >
                                                {editingChatId === chat.id ? (
                                                    <div className='space-y-2' onClick={(e) => e.stopPropagation()}>
                                                        <Input
                                                            value={editingChatName}
                                                            onChange={(e) => {
                                                                setEditingChatName(e.target.value);
                                                                setError('');
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleSaveEditChat(chat.id!, e as any);
                                                                } else if (e.key === 'Escape') {
                                                                    handleCancelEditChat(e as any);
                                                                }
                                                            }}
                                                            className='h-8'
                                                            autoFocus
                                                        />
                                                        {error && (
                                                            <p className='text-xs text-destructive'>{error}</p>
                                                        )}
                                                        <div className='flex gap-1'>
                                                            <Button
                                                                onClick={(e) => handleSaveEditChat(chat.id!, e)}
                                                                variant='secondary'
                                                                size='sm'
                                                                className='flex-1 h-7'
                                                            >
                                                                <Check className='h-3 w-3' />
                                                            </Button>
                                                            <Button
                                                                onClick={handleCancelEditChat}
                                                                variant='outline'
                                                                size='sm'
                                                                className='flex-1 h-7'
                                                            >
                                                                <X className='h-3 w-3' />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className='space-y-1'>
                                                            <p className='font-medium text-sm line-clamp-1'>
                                                                {chat.name}
                                                            </p>
                                                            <p className='text-xs text-muted-foreground line-clamp-1'>
                                                                {chat.title}
                                                            </p>
                                                            <div className='flex items-center gap-2 flex-wrap'>
                                                                <span className='text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded'>
                                                                    {chat.source}
                                                                </span>
                                                                <span className='text-xs text-muted-foreground'>
                                                                    {chat.messages.length} msgs
                                                                </span>
                                                            </div>
                                                            <p className='text-xs text-muted-foreground'>
                                                                {formatDate(chat.updatedAt)}
                                                            </p>
                                                        </div>
                                                        <div className='flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                                            <Button
                                                                onClick={(e) => handleStartEditChat(chat, e)}
                                                                variant='ghost'
                                                                size='sm'
                                                                className='h-7 px-2'
                                                                title='Rename'
                                                            >
                                                                <Pencil className='h-3 w-3' />
                                                            </Button>
                                                            <Button
                                                                onClick={(e) => handleDuplicateChat(chat, e)}
                                                                variant='ghost'
                                                                size='sm'
                                                                className='h-7 px-2'
                                                                title='Duplicate'
                                                            >
                                                                <Copy className='h-3 w-3' />
                                                            </Button>
                                                            <Button
                                                                onClick={(e) => handleDeleteChat(chat.id!, e)}
                                                                variant='ghost'
                                                                size='sm'
                                                                className='h-7 px-2 hover:text-destructive'
                                                                title='Delete'
                                                            >
                                                                <Trash2 className='h-3 w-3' />
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='text-center py-8 px-4 text-sm text-muted-foreground'>
                                        <MessageSquare className='h-12 w-12 mx-auto mb-2 opacity-30' />
                                        <p className='font-medium'>No saved chats yet</p>
                                        <p className='text-xs mt-1'>
                                            Save your conversations to access them later
                                        </p>
                                    </div>
                                )}
                            </ScrollArea>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <Separator className='my-2' />

                    {/* Saved Presets Section */}
                    <SidebarGroup>
                        <SidebarGroupLabel className='flex items-center gap-2 text-base'>
                            <Settings2 className='h-4 w-4' />
                            Saved Presets
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <ScrollArea className='h-[250px]'>
                                {presets && presets.length > 0 ? (
                                    <div className='space-y-1 px-2'>
                                        {presets.map((preset) => (
                                            <div
                                                key={preset.id}
                                                className='group rounded-lg border border-border bg-card p-3 hover:bg-accent/50 transition-colors cursor-pointer'
                                                onClick={(e) => handleLoadPreset(preset, e)}
                                            >
                                                {editingPresetId === preset.id ? (
                                                    <div className='space-y-2' onClick={(e) => e.stopPropagation()}>
                                                        <Input
                                                            value={editingPresetName}
                                                            onChange={(e) => {
                                                                setEditingPresetName(e.target.value);
                                                                setError('');
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleSaveEditPreset(preset.id!, e as any);
                                                                } else if (e.key === 'Escape') {
                                                                    handleCancelEditPreset(e as any);
                                                                }
                                                            }}
                                                            className='h-8'
                                                            autoFocus
                                                        />
                                                        {error && (
                                                            <p className='text-xs text-destructive'>{error}</p>
                                                        )}
                                                        <div className='flex gap-1'>
                                                            <Button
                                                                onClick={(e) => handleSaveEditPreset(preset.id!, e)}
                                                                variant='secondary'
                                                                size='sm'
                                                                className='flex-1 h-7'
                                                            >
                                                                <Check className='h-3 w-3' />
                                                            </Button>
                                                            <Button
                                                                onClick={handleCancelEditPreset}
                                                                variant='outline'
                                                                size='sm'
                                                                className='flex-1 h-7'
                                                            >
                                                                <X className='h-3 w-3' />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className='space-y-1'>
                                                            <p className='font-medium text-sm line-clamp-1'>
                                                                {preset.name}
                                                            </p>
                                                            <p className='text-xs text-muted-foreground'>
                                                                {formatDate(preset.updatedAt)}
                                                            </p>
                                                        </div>
                                                        <div className='flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                                            <Button
                                                                onClick={(e) => handleStartEditPreset(preset, e)}
                                                                variant='ghost'
                                                                size='sm'
                                                                className='h-7 px-2'
                                                                title='Rename'
                                                            >
                                                                <Pencil className='h-3 w-3' />
                                                            </Button>
                                                            <Button
                                                                onClick={(e) => handleDuplicatePreset(preset, e)}
                                                                variant='ghost'
                                                                size='sm'
                                                                className='h-7 px-2'
                                                                title='Duplicate'
                                                            >
                                                                <Copy className='h-3 w-3' />
                                                            </Button>
                                                            <Button
                                                                onClick={(e) => handleDeletePreset(preset.id!, e)}
                                                                variant='ghost'
                                                                size='sm'
                                                                className='h-7 px-2 hover:text-destructive'
                                                                title='Delete'
                                                            >
                                                                <Trash2 className='h-3 w-3' />
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='text-center py-8 px-4 text-sm text-muted-foreground'>
                                        <Settings2 className='h-12 w-12 mx-auto mb-2 opacity-30' />
                                        <p className='font-medium'>No saved presets yet</p>
                                        <p className='text-xs mt-1'>
                                            Save your PDF settings for quick access
                                        </p>
                                    </div>
                                )}
                            </ScrollArea>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className='border-t p-2'>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleStarRepo} className='w-full'>
                                <Github className='h-4 w-4' />
                                <span>Star on GitHub</span>
                                <Star className='ml-auto h-4 w-4' />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => setShowFeedback(true)} className='w-full'>
                                <MessageCircle className='h-4 w-4' />
                                <span>Send Feedback</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => setShowBuyMeCoffee(true)} className='w-full'>
                                <Coffee className='h-4 w-4' />
                                <span>Buy Me a Coffee</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            {/* Modals */}
            {/* <BuyMeCoffeeModal
                open={showBuyMeCoffee}
                onOpenChange={setShowBuyMeCoffee}
            />
            <FeedbackModal
                open={showFeedback}
                onOpenChange={setShowFeedback}
            /> */}
        </>
    );
};
