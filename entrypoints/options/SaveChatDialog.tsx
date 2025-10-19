import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Save, Loader2, SaveAll } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Message, PDFSettings } from './types';
import { SavedPreset, chatOperations, presetOperations, db } from '@/lib/settingsDB';

interface SaveChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    chatTitle: string;
    messages: Message[];
    currentSettings: PDFSettings;
    currentChatId: number | null;
    mode: 'save' | 'saveAs';
}

export const SaveChatDialog = ({
    open,
    onOpenChange,
    chatTitle,
    messages,
    currentSettings,
    currentChatId,
    mode,
}: SaveChatDialogProps) => {
    // Use useLiveQuery for automatic refresh
    const presets = useLiveQuery(
        () => db.presets.orderBy('updatedAt').reverse().toArray(),
        []
    );

    const [chatName, setChatName] = useState('');
    const [selectedPresetId, setSelectedPresetId] = useState<string>('current');
    const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [presetError, setPresetError] = useState('');

    useEffect(() => {
        if (open) {
            if (mode === 'saveAs') {
                // For Save As, suggest a new name
                setChatName(`${chatTitle} (Copy)`);
            } else {
                // For Save, use current title
                setChatName(chatTitle);
            }
            setSelectedPresetId('current');
            setError('');
        }
    }, [open, chatTitle, mode]);

    const handleSavePresetFirst = async () => {
        if (!newPresetName.trim()) {
            setPresetError('Please enter a preset name');
            return;
        }

        try {
            const exists = await presetOperations.presetNameExists(newPresetName.trim());
            if (exists) {
                setPresetError('A preset with this name already exists');
                return;
            }

            const newPresetId = await presetOperations.savePreset(
                newPresetName.trim(),
                currentSettings
            );

            // No need to loadPresets() - useLiveQuery will auto-refresh
            setSelectedPresetId(newPresetId.toString());
            setShowSavePresetDialog(false);
            setNewPresetName('');
            setPresetError('');
        } catch (err) {
            setPresetError('Failed to save preset');
            console.error(err);
        }
    };

    const handleSaveChat = async () => {
        if (!chatName.trim()) {
            setError('Please enter a chat name');
            return;
        }

        if (selectedPresetId === 'current') {
            // Show dialog to save current settings as preset
            setShowSavePresetDialog(true);
            return;
        }

        setSaving(true);
        setError('');

        try {
            const presetId = selectedPresetId === 'current' ? null : parseInt(selectedPresetId);
            let presetName = 'Current Settings';

            if (presetId !== null) {
                const preset = presets?.find(p => p.id === presetId);
                presetName = preset?.name || 'Unknown Preset';
            }

            if (mode === 'save' && currentChatId !== null) {
                // Update existing chat
                await chatOperations.updateChat(
                    currentChatId,
                    chatName.trim(),
                    chatTitle,
                    messages,
                    presetId,
                    presetName
                );
            } else {
                // Create new chat (Save As or new save)
                // Check if name already exists
                const exists = await chatOperations.chatNameExists(chatName.trim(), currentChatId || undefined);
                if (exists) {
                    setError('A chat with this name already exists');
                    setSaving(false);
                    return;
                }

                await chatOperations.saveChat(
                    chatName.trim(),
                    chatTitle,
                    messages,
                    presetId,
                    presetName
                );
            }

            // Reset and close
            setChatName('');
            setSelectedPresetId('current');
            setError('');
            onOpenChange(false);
        } catch (err) {
            setError('Failed to save chat');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handlePresetChange = (value: string) => {
        setSelectedPresetId(value);
        setError('');
    };

    return (
        <>
            <Dialog open={open && !showSavePresetDialog} onOpenChange={onOpenChange}>
                <DialogContent className='sm:max-w-[500px]'>
                    <DialogHeader>
                        <DialogTitle>
                            {mode === 'save' ? 'Update Chat' : 'Save Chat As'}
                        </DialogTitle>
                        <DialogDescription>
                            {mode === 'save'
                                ? 'Update the saved chat with current data and settings.'
                                : 'Save this chat with a name and select a PDF settings preset to use when exporting.'}
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
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='preset-select'>PDF Settings Preset</Label>
                            <Select value={selectedPresetId} onValueChange={handlePresetChange}>
                                <SelectTrigger id='preset-select'>
                                    <SelectValue placeholder='Select a preset' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='current'>
                                        Current Settings (Save as new preset)
                                    </SelectItem>
                                    {presets?.map((preset) => (
                                        <SelectItem key={preset.id} value={preset.id!.toString()}>
                                            {preset.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedPresetId === 'current' && (
                                <p className='text-xs text-muted-foreground'>
                                    You'll be prompted to save current settings as a preset
                                </p>
                            )}
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

            {/* Save Preset Dialog */}
            <Dialog open={showSavePresetDialog} onOpenChange={setShowSavePresetDialog}>
                <DialogContent className='sm:max-w-[450px]'>
                    <DialogHeader>
                        <DialogTitle>Save Current Settings as Preset</DialogTitle>
                        <DialogDescription>
                            First, save your current PDF settings as a preset to use with this chat.
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4 py-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='preset-name'>Preset Name</Label>
                            <Input
                                id='preset-name'
                                placeholder='Enter preset name...'
                                value={newPresetName}
                                onChange={(e) => {
                                    setNewPresetName(e.target.value);
                                    setPresetError('');
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSavePresetFirst();
                                    }
                                }}
                                autoFocus
                            />
                        </div>

                        {presetError && (
                            <p className='text-sm text-destructive'>{presetError}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => {
                                setShowSavePresetDialog(false);
                                setNewPresetName('');
                                setPresetError('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSavePresetFirst}>
                            <Save className='mr-2 h-4 w-4' />
                            Save Preset
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
