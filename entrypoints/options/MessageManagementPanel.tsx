import { X, MessageSquare, GripVertical, Image, ArrowUp, ArrowDown, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Message } from './types';
import { useTranslation } from 'react-i18next';
import { HiOutlineDocumentText } from "react-icons/hi2";
import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
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
import { UnsavedChangesDialog } from './UnsavedChangesDialog';

interface MessageManagementPanelProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[] | null;
    selectedMessages: Set<number>;
    onToggleMessage: (index: number) => void;
    onReorderMessages: (newOrder: Message[]) => void;
    onSaveChanges: (messages: Message[], selectedIndices: Set<number>) => void;
    onCloseRequestCancelled?: () => void;
}

export interface MessageManagementPanelRef {
    requestClose: () => void;
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
                <div className='flex flex-col justify-between items-center gap-3 h-full'>
                    <GripVertical size={18} className="text-muted-foreground" />
                    <div className="flex flex-col">
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

export const MessageManagementPanel = forwardRef<MessageManagementPanelRef, MessageManagementPanelProps>(({
    isOpen,
    onClose,
    messages,
    selectedMessages,
    onToggleMessage,
    onReorderMessages,
    onSaveChanges,
    onCloseRequestCancelled,
}, ref) => {
    const { t } = useTranslation();

    // Local state for working copy
    const [localMessages, setLocalMessages] = useState<Message[] | null>(null);
    const [localSelectedMessages, setLocalSelectedMessages] = useState<Set<number>>(new Set());

    // Store stable IDs for each message
    const [messageIds, setMessageIds] = useState<string[]>([]);
    const prevMessagesRef = useRef<Message[] | null>(null);

    // Track changes
    const [hasChanges, setHasChanges] = useState(false);
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

    // Original state for comparison
    const originalMessagesRef = useRef<Message[] | null>(null);
    const originalSelectedRef = useRef<Set<number>>(new Set());

    // Initialize local state when panel opens or messages change externally
    useEffect(() => {
        if (isOpen && messages) {
            // Only reset if messages changed externally (not from our local changes)
            const messagesChanged = JSON.stringify(messages) !== JSON.stringify(originalMessagesRef.current);
            if (messagesChanged || !originalMessagesRef.current) {
                setLocalMessages([...messages]);
                setLocalSelectedMessages(new Set(selectedMessages));
                originalMessagesRef.current = [...messages];
                originalSelectedRef.current = new Set(selectedMessages);
                setHasChanges(false);
            }
        }
    }, [isOpen, messages, selectedMessages]);

    // Check for changes whenever local state changes
    const checkForChanges = useCallback(() => {
        if (!localMessages || !originalMessagesRef.current) return false;

        // Check if messages order changed
        const messagesOrderChanged = JSON.stringify(localMessages) !== JSON.stringify(originalMessagesRef.current);

        // Check if selection changed
        const originalSelected = originalSelectedRef.current;
        const selectionChanged = localSelectedMessages.size !== originalSelected.size ||
            [...localSelectedMessages].some(idx => !originalSelected.has(idx));

        return messagesOrderChanged || selectionChanged;
    }, [localMessages, localSelectedMessages]);

    useEffect(() => {
        setHasChanges(checkForChanges());
    }, [localMessages, localSelectedMessages, checkForChanges]);

    // Generate stable IDs when messages change (but not on reorder)
    useEffect(() => {
        if (!localMessages) {
            setMessageIds([]);
            prevMessagesRef.current = null;
            return;
        }

        // Check if this is a completely new set of messages (not just reordered)
        const prevMessages = prevMessagesRef.current;
        const isNewMessageSet = !prevMessages || prevMessages.length !== localMessages.length;

        if (isNewMessageSet) {
            // Generate new IDs for new message set
            const newIds = localMessages.map(() => generateUniqueId());
            setMessageIds(newIds);
        }
        // If same length, IDs are maintained through reorder operations

        prevMessagesRef.current = localMessages;
    }, [localMessages]);

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

        if (over && active.id !== over.id && localMessages && messageIds.length === localMessages.length) {
            const oldIndex = messageIds.indexOf(active.id.toString());
            const newIndex = messageIds.indexOf(over.id.toString());

            if (oldIndex !== -1 && newIndex !== -1) {
                const newMessages = arrayMove(localMessages, oldIndex, newIndex);
                const newIds = arrayMove(messageIds, oldIndex, newIndex);

                // Update selection indices to match new positions
                const newSelected = new Set<number>();
                localSelectedMessages.forEach(selectedIdx => {
                    if (selectedIdx === oldIndex) {
                        newSelected.add(newIndex);
                    } else if (selectedIdx > oldIndex && selectedIdx <= newIndex) {
                        newSelected.add(selectedIdx - 1);
                    } else if (selectedIdx < oldIndex && selectedIdx >= newIndex) {
                        newSelected.add(selectedIdx + 1);
                    } else {
                        newSelected.add(selectedIdx);
                    }
                });

                setMessageIds(newIds);
                setLocalMessages(newMessages);
                setLocalSelectedMessages(newSelected);
            }
        }
    };

    const handleMoveUp = (index: number) => {
        if (localMessages && index > 0 && messageIds.length === localMessages.length) {
            const newMessages = arrayMove(localMessages, index, index - 1);
            const newIds = arrayMove(messageIds, index, index - 1);

            // Update selection indices
            const newSelected = new Set<number>();
            localSelectedMessages.forEach(selectedIdx => {
                if (selectedIdx === index) {
                    newSelected.add(index - 1);
                } else if (selectedIdx === index - 1) {
                    newSelected.add(index);
                } else {
                    newSelected.add(selectedIdx);
                }
            });

            setMessageIds(newIds);
            setLocalMessages(newMessages);
            setLocalSelectedMessages(newSelected);
        }
    };

    const handleMoveDown = (index: number) => {
        if (localMessages && index < localMessages.length - 1 && messageIds.length === localMessages.length) {
            const newMessages = arrayMove(localMessages, index, index + 1);
            const newIds = arrayMove(messageIds, index, index + 1);

            // Update selection indices
            const newSelected = new Set<number>();
            localSelectedMessages.forEach(selectedIdx => {
                if (selectedIdx === index) {
                    newSelected.add(index + 1);
                } else if (selectedIdx === index + 1) {
                    newSelected.add(index);
                } else {
                    newSelected.add(selectedIdx);
                }
            });

            setMessageIds(newIds);
            setLocalMessages(newMessages);
            setLocalSelectedMessages(newSelected);
        }
    };

    const handleToggleMessage = (index: number) => {
        const newSelected = new Set(localSelectedMessages);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setLocalSelectedMessages(newSelected);
    };

    const handleSave = () => {
        if (localMessages) {
            // Filter out deselected messages
            const filteredMessages = localMessages.filter((_, index) => localSelectedMessages.has(index));
            // Create new selection set with all remaining messages selected
            const newSelected = new Set<number>(filteredMessages.map((_, i) => i));
            onSaveChanges(filteredMessages, newSelected);
            setHasChanges(false);
            onClose();
        }
    };

    const handleCancel = () => {
        // Restore original state
        if (originalMessagesRef.current) {
            setLocalMessages([...originalMessagesRef.current]);
            setLocalSelectedMessages(new Set(originalSelectedRef.current));
        }
        setHasChanges(false);
        onClose();
    };

    const handleClose = () => {
        if (hasChanges) {
            setShowUnsavedDialog(true);
        } else {
            onClose();
        }
    };

    // Expose requestClose method to parent via ref
    useImperativeHandle(ref, () => ({
        requestClose: () => {
            handleClose();
        }
    }), [hasChanges]);

    const handleUnsavedSave = () => {
        setShowUnsavedDialog(false);
        handleSave();
    };

    const handleUnsavedDiscard = () => {
        setShowUnsavedDialog(false);
        handleCancel();
    };

    const handleUnsavedCancel = () => {
        setShowUnsavedDialog(false);
        onCloseRequestCancelled?.();
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
                className={`absolute top-[2px] right-0 h-[calc(100%-2px)] w-[350px] xl:w-[420px] bg-accent border-l border-border shadow-xl z-20 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className='flex items-center justify-between px-4 pt-2.5 pb-[6px] border-b border-border bg-accent'>
                    <div className='flex items-center gap-2'>
                        <MessageSquare size={18} />
                        <h2 className='text-sm font-semibold'>{t('settings.messages.title')}</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className='h-8 w-8'
                    >
                        <X size={18} />
                    </Button>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-y-auto p-4'>
                    {!localMessages || localMessages.length === 0 ? (
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
                                    {localMessages.map((message, index) => (
                                        <SortableMessageItem
                                            key={messageIds[index] || `temp-${index}`}
                                            messageId={messageIds[index] || `temp-${index}`}
                                            message={message}
                                            index={index}
                                            isSelected={localSelectedMessages.has(index)}
                                            onToggle={handleToggleMessage}
                                            getRoleBadgeColor={getRoleBadgeColor}
                                            truncateText={truncateText}
                                            onMoveUp={handleMoveUp}
                                            onMoveDown={handleMoveDown}
                                            isFirst={index === 0}
                                            isLast={index === localMessages.length - 1}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                {/* Footer */}
                {localMessages && localMessages.length > 0 && (
                    <div className="px-4 py-3 border-t border-border bg-accent">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center justify-between w-full">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancel}
                                    className="h-8"
                                >
                                    <RotateCcw size={14} className="mr-1.5" />
                                    {t('unsavedChatWarning.cancel')}
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    {t('settings.messages.selectedCount', { selected: localSelectedMessages.size, total: localMessages.length })}
                                </span>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={!hasChanges}
                                    className="h-8"
                                >
                                    <Save size={14} className="mr-1.5" />
                                    {t('unsavedChatWarning.save')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Unsaved Changes Dialog */}
            <UnsavedChangesDialog
                open={showUnsavedDialog}
                onSave={handleUnsavedSave}
                onDiscard={handleUnsavedDiscard}
                onCancel={handleUnsavedCancel}
            />
        </>
    );
});
