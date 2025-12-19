import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, SavedChat, chatOperations } from '@/lib/settingsDB';
import { ChatSource, Message } from './types';
import { useTheme } from '@/lib/useTheme';
import chatgpt from "@/assets/openai.svg";
import claude from "@/assets/claude.svg";
import gemini from "@/assets/gemini-fill.svg";
import deepseek from "@/assets/deepseek-fill.svg";
import chatgptLight from "@/assets/openai-light.svg";
import claudeLight from "@/assets/claude-light.svg";
import geminiLight from "@/assets/gemini-fill-light.svg";
import deepseekLight from "@/assets/deepseek-fill-light.svg";
import { PiGitMerge } from 'react-icons/pi';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

interface MergeChatsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentMessages: Message[];
    onMerge: (mergedMessages: Message[]) => void;
}

interface ChatForMerge extends SavedChat {
    isCurrentChat?: boolean;
}

const SourceLabels: Record<ChatSource, string> = {
    chatgpt: 'ChatGPT',
    claude: 'Claude',
    gemini: 'Gemini',
    deepseek: 'DeepSeek',
};

interface SortableChatCardProps {
    chat: ChatForMerge;
    sourceIcon: string;
    onRemove?: () => void;
    isSelected?: boolean;
    onCheck?: (checked: boolean) => void;
    isDraggable?: boolean;
}

const SortableChatCard = ({
    chat,
    sourceIcon,
    onRemove,
    isSelected,
    onCheck,
    isDraggable = false,
}: SortableChatCardProps) => {

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({
            id: `chat-${chat.id}`,
            disabled: !isDraggable,
        });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`border rounded-lg p-3 transition-colors ${chat.isCurrentChat
                ? 'bg-primary/10 border-primary hover:bg-primary/15'
                : 'bg-card border-border hover:bg-accent/50'
                }`}
        >
            <div className="flex items-start gap-3">
                {isDraggable ? (
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground pt-1"
                    >
                        <GripVertical size={18} />
                    </div>
                ) : null}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <img
                            src={sourceIcon}
                            alt={chat.source}
                            className="size-6 mr-1"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{chat.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {chat.messages.length} {t('mergeChatsDialog.messages')}
                            </p>
                        </div>
                    </div>

                </div>
                {onRemove ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 shrink-0"
                        onClick={onRemove}
                        disabled={isDragging}
                    >
                        <X size={14} />
                    </Button>
                ) : onCheck !== undefined ? (
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onCheck(checked === true)}
                    />
                ) : null}
            </div>
        </div>
    );
};

export const MergeChatsDialog = ({
    isOpen,
    onClose,
    currentMessages,
    onMerge,
}: MergeChatsDialogProps) => {
    const { t } = useTranslation();
    const [selectedSource, setSelectedSource] = useState<ChatSource>('chatgpt');
    const [selectedChats, setSelectedChats] = useState<Set<number>>(new Set());
    const [mergedChats, setMergedChats] = useState<ChatForMerge[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { effectiveTheme } = useTheme();

    const SourceIcons: Record<string, string> = useMemo(() => ({
        chatgpt: effectiveTheme === 'dark' ? chatgptLight : chatgpt,
        claude: effectiveTheme === 'dark' ? claudeLight : claude,
        gemini: effectiveTheme === 'dark' ? geminiLight : gemini,
        deepseek: effectiveTheme === 'dark' ? deepseekLight : deepseek,
    }), [effectiveTheme]);

    // Get all chats for the selected source
    const allChats = useLiveQuery(async () => {
        return await chatOperations.getChatsBySource(selectedSource);
    }, [selectedSource]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Filter chats based on search term
    const filteredChats = (allChats || []).filter((chat) =>
        chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Add current chat to merged chats on dialog open
    useEffect(() => {
        if (isOpen && mergedChats.length === 0) {
            setMergedChats([
                {
                    id: -1,
                    name: t('mergeChatsDialog.currentChat'),
                    title: t('mergeChatsDialog.currentChat'),
                    messages: currentMessages,
                    source: 'chatgpt',
                    settings: {} as any,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    syncId: '',
                    isCurrentChat: true,
                },
            ]);
        }
    }, [isOpen]);

    const handleSelectChat = (chatId: number, checked: boolean) => {
        const newSelected = new Set(selectedChats);
        if (checked) {
            newSelected.add(chatId);
        } else {
            newSelected.delete(chatId);
        }
        setSelectedChats(newSelected);
    };

    const handleAddToMerge = (chat: SavedChat) => {
        if (!mergedChats.some((c) => c.id === chat.id)) {
            setMergedChats([...mergedChats, chat]);
        }
    };

    const handleRemoveFromMerge = (chatId: number | undefined) => {
        setMergedChats(mergedChats.filter((c) => c.id !== chatId));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id && mergedChats) {
            const oldIndex = mergedChats.findIndex(
                (c) => `chat-${c.id}` === active.id
            );
            const newIndex = mergedChats.findIndex(
                (c) => `chat-${c.id}` === over.id
            );

            if (oldIndex !== -1 && newIndex !== -1) {
                const newChats = arrayMove(mergedChats, oldIndex, newIndex);
                setMergedChats(newChats);
            }
        }
    };

    const handleMerge = () => {
        // Merge all messages from all chats in the merged list
        const allMergedMessages: Message[] = [];

        mergedChats.forEach((chat) => {
            if (chat.messages && Array.isArray(chat.messages)) {
                allMergedMessages.push(...chat.messages);
            }
        });

        onMerge(allMergedMessages);
        onClose();
    };

    const handleClose = () => {
        setSelectedChats(new Set());
        setMergedChats([]);
        setSearchTerm('');
        onClose();
    };

    const sourceOptions: ChatSource[] = ['chatgpt', 'claude', 'gemini', 'deepseek'];

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="!max-w-4xl h-[80vh] flex flex-col bg-card">
                <DialogHeader className='flex flex-row gap-3 items-center'>
                    <PiGitMerge size={27} />
                    <div>
                        <DialogTitle className="flex items-center gap-2">
                            {t('mergeChatsDialog.title')}
                        </DialogTitle>
                        <DialogDescription className=" text-xs text-muted-foreground">
                            {t('mergeChatsDialog.description')}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="flex-1 flex gap-4 overflow-hidden">
                    {/* Left Section - Available Chats */}
                    <div className="w-1/2 flex flex-col gap-3 border-r border-border pr-4">
                        <div className='px-1'>
                            <label className="text-sm font-medium mb-2 block">
                                {t('mergeChatsDialog.selectSource')}
                            </label>
                            <Select value={selectedSource} onValueChange={(value) => {
                                setSelectedSource(value as ChatSource);
                                setSelectedChats(new Set());
                            }}>
                                <SelectTrigger className=''>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sourceOptions.map((source) => (
                                        <SelectItem key={source} value={source}>
                                            <img
                                                src={SourceIcons[source]}
                                                alt={source}
                                                className="size-4 mr-2"
                                            />
                                            {SourceLabels[source]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='px-1'>
                            <label className="text-sm font-medium mb-2 block">
                                {t('mergeChatsDialog.searchChats')}
                            </label>
                            <Input
                                placeholder={t('mergeChatsDialog.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden px-1">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                {t('mergeChatsDialog.availableChats')}
                            </p>
                            <div className="overflow-y-auto flex-1 min-h-0">
                                <div className="space-y-2 pr-4">
                                    {filteredChats && filteredChats.length > 0 ? (
                                        filteredChats.map((chat) => (
                                            <div
                                                key={chat.id}
                                                className="flex items-center gap-2"
                                            >
                                                <Checkbox
                                                    checked={selectedChats.has(chat.id || 0)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectChat(
                                                            chat.id || 0,
                                                            checked === true
                                                        )
                                                    }
                                                    className='border-black/40 dark:border-input'
                                                />
                                                <div
                                                    className="flex-1 cursor-pointer p-2 rounded hover:bg-accent"
                                                    onClick={() => {
                                                        const newSelected = new Set(
                                                            selectedChats
                                                        );
                                                        if (
                                                            newSelected.has(chat.id || 0)
                                                        ) {
                                                            newSelected.delete(chat.id || 0);
                                                        } else {
                                                            newSelected.add(chat.id || 0);
                                                        }
                                                        setSelectedChats(newSelected);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={SourceIcons[chat.source]}
                                                            alt={chat.source}
                                                            className="size-4 mr-2"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium truncate">
                                                                {chat.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {chat.messages.length} {t('importChats.messages')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p className="text-sm">{t('mergeChatsDialog.noChatsFound')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => {
                                const chatsToAdd: SavedChat[] = [];
                                selectedChats.forEach((chatId) => {
                                    const chat = allChats?.find((c) => c.id === chatId);
                                    if (chat && !mergedChats.some((mc) => mc.id === chat.id)) {
                                        chatsToAdd.push(chat);
                                    }
                                });
                                setMergedChats([...mergedChats, ...chatsToAdd]);
                                setSelectedChats(new Set());
                            }}
                            disabled={selectedChats.size === 0}
                            className="w-full"
                        >
                            {t('mergeChatsDialog.addSelected')} ({selectedChats.size})
                        </Button>
                    </div>

                    {/* Right Section - Merged Chats */}
                    <div className="w-1/2 flex flex-col gap-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                {t('mergeChatsDialog.chatsToMerge')} ({mergedChats.length})
                            </p>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <ScrollArea className="h-full">
                                <div className="pr-4">
                                    {mergedChats.length > 0 ? (
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={mergedChats.map(
                                                    (c) => `chat-${c.id}`
                                                )}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="space-y-2">
                                                    {mergedChats.map((chat) => (
                                                        <SortableChatCard
                                                            key={chat.id}
                                                            chat={chat}
                                                            sourceIcon={SourceIcons[chat.source]}
                                                            isDraggable={true}
                                                            onRemove={
                                                                !chat.isCurrentChat
                                                                    ? () =>
                                                                        handleRemoveFromMerge(
                                                                            chat.id
                                                                        )
                                                                    : undefined
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <p>Add chats to merge</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-border">
                    <Button variant="outline" onClick={handleClose}>
                        {t('mergeChatsDialog.cancel')}
                    </Button>
                    <Button
                        onClick={handleMerge}
                        disabled={mergedChats.length <= 1}
                        className="gap-2"
                    >
                        <PiGitMerge size={16} />
                        {t('mergeChatsDialog.merge')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
