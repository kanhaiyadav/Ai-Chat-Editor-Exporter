import { X, MessageSquare, GripVertical, Image, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Message } from './types';
import { useTranslation } from 'react-i18next';
import { HiOutlineDocumentText } from "react-icons/hi2";
import { useState, useEffect, useRef } from 'react';
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

interface MessageManagementPanelProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[] | null;
    selectedMessages: Set<number>;
    onToggleMessage: (index: number) => void;
    onReorderMessages: (newOrder: Message[]) => void;
}

// Counter for generating unique IDs
let messageIdCounter = 0;
const generateUniqueId = () => `msg-${++messageIdCounter}`;

interface SortableMessageItemProps {
    message: Message;
    index: number;
    isSelected: boolean;
    onToggle: (index: number) => void;
    getRoleBadgeColor: (role: string) => string;
    truncateText: (text: string, maxLength?: number) => string;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    isFirst: boolean;
    isLast: boolean;
}

const SortableMessageItem = ({
    message,
    index,
    isSelected,
    onToggle,
    getRoleBadgeColor,
    truncateText,
    messageId,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}: SortableMessageItemProps & { messageId: string }) => {
    const { t } = useTranslation();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: messageId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleMoveUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMoveUp(index);
    };

    const handleMoveDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMoveDown(index);
    };

    const handleCheckboxChange = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="border border-border rounded-lg p-3 bg-card hover:bg-accent/50 transition-colors cursor-grab active:cursor-grabbing"
        >
            <div className="flex items-start gap-3">
                <div onClick={handleCheckboxChange}>
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggle(index)}
                        className="mt-1"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getRoleBadgeColor(message.role)}`}>
                            {message.role === 'user' ? t('settings.messages.user') : t('settings.messages.ai')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            #{index + 1}
                        </span>
                    </div>
                    {message.content !== "" && (
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            {truncateText(message.content)}
                        </p>
                    )}
                    <div className='flex items-center gap-3'>
                        {message.images && message.images.length > 0 && (
                            <div className='flex items-center'>
                                <Image size={16} className="inline-block mr-1" />
                                <span className="text-sm text-foreground/80">
                                    {message.images.length} {t('settings.messages.image', { count: message.images.length })}
                                </span>
                            </div>
                        )}
                        {message.attachments && message.attachments.length > 0 && (
                            <div className='flex items-center'>
                                <HiOutlineDocumentText size={16} className="inline-block mr-1" />
                                <span className="text-sm text-foreground/80">
                                    {message.attachments.length} {t('settings.messages.attachment', { count: message.attachments.length })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className='flex flex-col justify-between items-center gap-1'>
                    <GripVertical size={18} className="text-muted-foreground" />
                    <div className="flex flex-col gap-0.5">
                        <button
                            onClick={handleMoveUp}
                            disabled={isFirst}
                            className={`p-1 rounded hover:bg-accent transition-colors ${isFirst ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                            title={t('settings.messages.moveUp')}
                        >
                            <ArrowUp size={14} className="text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                            onClick={handleMoveDown}
                            disabled={isLast}
                            className={`p-1 rounded hover:bg-accent transition-colors ${isLast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                            title={t('settings.messages.moveDown')}
                        >
                            <ArrowDown size={14} className="text-muted-foreground hover:text-foreground" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MessageManagementPanel = ({
    isOpen,
    onClose,
    messages,
    selectedMessages,
    onToggleMessage,
    onReorderMessages,
}: MessageManagementPanelProps) => {
    const { t } = useTranslation();

    // Store stable IDs for each message
    const [messageIds, setMessageIds] = useState<string[]>([]);
    const prevMessagesRef = useRef<Message[] | null>(null);

    // Generate stable IDs when messages change (but not on reorder)
    useEffect(() => {
        if (!messages) {
            setMessageIds([]);
            prevMessagesRef.current = null;
            return;
        }

        // Check if this is a completely new set of messages (not just reordered)
        const prevMessages = prevMessagesRef.current;
        const isNewMessageSet = !prevMessages || prevMessages.length !== messages.length;

        if (isNewMessageSet) {
            // Generate new IDs for new message set
            const newIds = messages.map(() => generateUniqueId());
            setMessageIds(newIds);
        }
        // If same length, IDs are maintained through reorder operations

        prevMessagesRef.current = messages;
    }, [messages]);

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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id && messages && messageIds.length === messages.length) {
            const oldIndex = messageIds.indexOf(active.id.toString());
            const newIndex = messageIds.indexOf(over.id.toString());

            if (oldIndex !== -1 && newIndex !== -1) {
                const newMessages = arrayMove(messages, oldIndex, newIndex);
                const newIds = arrayMove(messageIds, oldIndex, newIndex);
                setMessageIds(newIds);
                onReorderMessages(newMessages);
            }
        }
    };

    const handleMoveUp = (index: number) => {
        if (messages && index > 0 && messageIds.length === messages.length) {
            const newMessages = arrayMove(messages, index, index - 1);
            const newIds = arrayMove(messageIds, index, index - 1);
            setMessageIds(newIds);
            onReorderMessages(newMessages);
        }
    };

    const handleMoveDown = (index: number) => {
        if (messages && index < messages.length - 1 && messageIds.length === messages.length) {
            const newMessages = arrayMove(messages, index, index + 1);
            const newIds = arrayMove(messageIds, index, index + 1);
            setMessageIds(newIds);
            onReorderMessages(newMessages);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        return role === 'user'
            ? 'bg-amber-100 !text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
            : 'bg-blue-100 !text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    };

    const truncateText = (text: string, maxLength: number = 80) => {
        const strippedText = text.replace(/<[^>]*>/g, '');
        return strippedText.length > maxLength
            ? strippedText.substring(0, maxLength) + '...'
            : strippedText;
    };

    return (
        <>
            {/* Sliding Panel - positioned to overlay settings panel only */}
            <div
                className={`absolute top-0 right-0 h-full w-[350px] xl:w-[420px] bg-background border-l border-border shadow-xl z-20 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className='flex items-center justify-between px-4 py-3 pb-[7px] border-b border-border bg-accent'>
                    <div className='flex items-center gap-2'>
                        <MessageSquare size={18} />
                        <h2 className='text-sm font-semibold'>{t('settings.messages.title')}</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className='h-8 w-8'
                    >
                        <X size={18} />
                    </Button>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-y-auto p-4'>
                    {!messages || messages.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">{t('settings.messages.noMessages')}</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={messageIds}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {messages.map((message, index) => (
                                        <SortableMessageItem
                                            key={messageIds[index] || `temp-${index}`}
                                            messageId={messageIds[index] || `temp-${index}`}
                                            message={message}
                                            index={index}
                                            isSelected={selectedMessages.has(index)}
                                            onToggle={onToggleMessage}
                                            getRoleBadgeColor={getRoleBadgeColor}
                                            truncateText={truncateText}
                                            onMoveUp={handleMoveUp}
                                            onMoveDown={handleMoveDown}
                                            isFirst={index === 0}
                                            isLast={index === messages.length - 1}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                {/* Footer */}
                {messages && messages.length > 0 && (
                    <div className="px-4 py-3 border-t border-border bg-accent text-xs text-muted-foreground">
                        {t('settings.messages.selectedCount', { selected: selectedMessages.size, total: messages.length })}
                    </div>
                )}
            </div>
        </>
    );
};
