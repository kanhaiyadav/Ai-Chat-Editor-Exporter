import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, MessageSquare, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from './types';
import { RiChatSettingsLine } from "react-icons/ri";
import { LuSettings } from "react-icons/lu";
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
import { Image } from 'lucide-react';
import { HiOutlineDocumentText } from "react-icons/hi2";

interface MessageManagementProps {
    messages: Message[] | null;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdateMessage: (index: number, content: string) => void;
    onToggleMessage: (index: number) => void;
    onReorderMessages: (newOrder: Message[]) => void;
    selectedMessages: Set<number>;
}

interface SortableMessageItemProps {
    message: Message;
    index: number;
    isSelected: boolean;
    onToggle: (index: number) => void;
    getRoleBadgeColor: (role: string) => string;
    truncateText: (text: string, maxLength?: number) => string;
}

// Simple hash function to create stable IDs for messages
const generateMessageHash = (message: Message): string => {
    const content = `${message.role}-${message.content || ''}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return `message-${Math.abs(hash)}`;
};

const SortableMessageItem = ({
    message,
    index,
    isSelected,
    onToggle,
    getRoleBadgeColor,
    truncateText,
}: SortableMessageItemProps) => {
    const messageId = generateMessageHash(message);
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="border border-border rounded-lg p-3 bg-card hover:bg-accent/50 transition-colors"
        >
            <div className="flex items-start gap-3">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggle(index)}
                    className="mt-1"
                />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getRoleBadgeColor(message.role)}`}>
                            {message.role === 'user' ? 'User' : 'AI'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            #{index + 1}
                        </span>
                    </div>
                    {
                        message.content !== "" &&
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            {truncateText(message.content)}
                        </p>
                    }
                    <div className='flex items-center gap-3'>
                        {
                            message.images && message.images.length > 0 && (
                                <div className='flex items-center'>
                                    <Image size={16} className="inline-block mr-1" />
                                    <span className="text-sm text-foreground/80">
                                        {message.images.length} image{message.images.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                            )
                        }
                        {
                            message.attachments && message.attachments.length > 0 && (
                                <div className='flex items-center'>
                                    <HiOutlineDocumentText size={16} className="inline-block mr-1" />
                                    <span className="text-sm text-foreground/80">
                                        {message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                            )
                        }
                    </div>
                </div>
                <div className='flex flex-col justify-between items-center'>
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <GripVertical size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MessageManagement = ({
    messages,
    isExpanded,
    onToggle,
    onUpdateMessage,
    onToggleMessage,
    onReorderMessages,
    selectedMessages
}: MessageManagementProps) => {

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

        if (over && active.id !== over.id && messages) {
            // Find indices by matching the message hashes
            const activeId = active.id.toString();
            const overId = over.id.toString();

            const oldIndex = messages.findIndex((msg) => generateMessageHash(msg) === activeId);
            const newIndex = messages.findIndex((msg) => generateMessageHash(msg) === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newMessages = arrayMove(messages, oldIndex, newIndex);
                onReorderMessages(newMessages);
            }
        }
    };



    const getRoleBadgeColor = (role: string) => {
        return role === 'user'
            ? 'bg-amber-100 !text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
            : 'bg-blue-100 !text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    };

    const truncateText = (text: string, maxLength: number = 60) => {
        // Remove HTML tags for preview
        const strippedText = text.replace(/<[^>]*>/g, '');
        return strippedText.length > maxLength
            ? strippedText.substring(0, maxLength) + '...'
            : strippedText;
    };

    return (
        <>
            <Card className="shadow-sm border border-gray-200">
                <Collapsible open={isExpanded} onOpenChange={onToggle}>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="px-4 cursor-pointer mb-[-3px]">
                            <CardTitle className="flex items-center justify-between font-semibold">
                                <span className="flex items-center gap-2">
                                    <MessageSquare size={18} />
                                    Messages
                                </span>
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                        <CardContent className="px-4 pb-4 space-y-3">
                            {!messages || messages.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No messages available</p>
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={messages.map((message) => generateMessageHash(message))}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-2 mt-2">
                                            {messages.map((message, index) => (
                                                <SortableMessageItem
                                                    key={generateMessageHash(message)}
                                                    message={message}
                                                    index={index}
                                                    isSelected={selectedMessages.has(index)}
                                                    onToggle={onToggleMessage}
                                                    getRoleBadgeColor={getRoleBadgeColor}
                                                    truncateText={truncateText}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}

                            {messages && messages.length > 0 && (
                                <div className="pt-2 border-t text-xs text-muted-foreground">
                                    {selectedMessages.size} of {messages.length} messages selected
                                </div>
                            )}
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
        </>
    );
};
