import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
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
import { PDFSettings } from './types';
import { SavedPreset, presetOperations, db } from '@/lib/settingsDB';

interface SavePresetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentSettings: PDFSettings;
    currentPresetId: number | null;
    onPresetCreated?: (presetId: number) => void;
}

export const SavePresetDialog = ({
    open,
    onOpenChange,
    currentSettings,
    currentPresetId,
    onPresetCreated,
}: SavePresetDialogProps) => {
    const presets = useLiveQuery(
        () => db.presets.orderBy('updatedAt').reverse().toArray(),
        []
    );

    const [presetName, setPresetName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            if (currentPresetId !== null) {
                // For Save As from existing preset, suggest a new name
                const preset = presets?.find(p => p.id === currentPresetId);
                setPresetName(preset ? `${preset.name} (Copy)` : '');
            } else {
                // For new preset
                setPresetName('');
            }
            setError('');
        }
    }, [open, currentPresetId, presets]);

    const handleSavePreset = async () => {
        if (!presetName.trim()) {
            setError('Please enter a preset name');
            return;
        }

        setSaving(true);
        setError('');

        try {
            // Always create new preset (Save As)
            const exists = await presetOperations.presetNameExists(
                presetName.trim(),
                currentPresetId || undefined
            );
            if (exists) {
                setError('A preset with this name already exists');
                setSaving(false);
                return;
            }

            const newPresetId = await presetOperations.savePreset(presetName.trim(), currentSettings);

            // Notify parent component of the new preset ID
            if (onPresetCreated && newPresetId) {
                onPresetCreated(newPresetId);
            }

            // Reset and close
            setPresetName('');
            setError('');
            onOpenChange(false);
        } catch (err) {
            setError('Failed to save preset');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[450px]'>
                <DialogHeader>
                    <DialogTitle>Save Preset As</DialogTitle>
                    <DialogDescription>
                        Save current PDF settings as a new preset.
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='preset-name'>Preset Name</Label>
                        <Input
                            id='preset-name'
                            placeholder='Enter preset name...'
                            value={presetName}
                            onChange={(e) => {
                                setPresetName(e.target.value);
                                setError('');
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSavePreset();
                                }
                            }}
                            autoFocus
                        />
                    </div>

                    {error && <p className='text-sm text-destructive'>{error}</p>}
                </div>

                <DialogFooter>
                    <Button
                        variant='outline'
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSavePreset} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className='mr-2 h-4 w-4' />
                                Save Preset
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
