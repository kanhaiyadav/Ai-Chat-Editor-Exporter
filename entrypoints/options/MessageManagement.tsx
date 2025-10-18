import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Message } from './types';
import { ChatEditor } from './Editor';
import { RiChatSettingsLine } from "react-icons/ri";
import { LuSettings } from "react-icons/lu";

interface MessageManagementProps {
    messages: Message[] | null;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdateMessage: (index: number, content: string) => void;
    onToggleMessage: (index: number) => void;
    selectedMessages: Set<number>;
}

export const MessageManagement = ({
    messages,
    isExpanded,
    onToggle,
    onUpdateMessage,
    onToggleMessage,
    selectedMessages
}: MessageManagementProps) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editedContent, setEditedContent] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleEditClick = (index: number, content: string) => {
        setEditingIndex(index);
        setEditedContent(content);
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (editingIndex !== null) {
            onUpdateMessage(editingIndex, editedContent);
            setIsDialogOpen(false);
            setEditingIndex(null);
            setEditedContent('');
        }
    };

    const handleCancel = () => {
        setIsDialogOpen(false);
        setEditingIndex(null);
        setEditedContent('');
    };

    const getRoleBadgeColor = (role: string) => {
        return role === 'user'
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
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
                                <div className="space-y-2 mt-2">
                                    {messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className="border rounded-lg p-3 bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    checked={selectedMessages.has(index)}
                                                    onCheckedChange={() => onToggleMessage(index)}
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

                                                    <p className="text-sm text-foreground/80 leading-relaxed">
                                                        {truncateText(message.content)}
                                                    </p>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 shrink-0"
                                                    onClick={() => handleEditClick(index, message.content)}
                                                >
                                                    <Edit size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit size={20} />
                            Edit Message
                        </DialogTitle>
                        <DialogDescription>
                            Make changes to your message content. Changes will be reflected in the preview and exported PDF.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden py-4">
                        <ChatEditor
                            initialHtml={editedContent}
                            onChange={setEditedContent}
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="secondary"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-primary"
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
