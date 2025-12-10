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
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
            setError(t('settings.presets.errorName'));
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
                setError(t('settings.presets.errorExists'));
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
            setError(t('settings.presets.errorSave'));
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[450px]'>
                <DialogHeader>
                    <DialogTitle>{t('settings.presets.saveTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('settings.presets.saveDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='preset-name'>{t('settings.presets.presetName')}</Label>
                        <Input
                            id='preset-name'
                            placeholder={t('settings.presets.placeholder')}
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
                        {t('dialog.cancel')}
                    </Button>
                    <Button onClick={handleSavePreset} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                {t('settings.presets.saving')}
                            </>
                        ) : (
                            <>
                                <Save className='mr-2 h-4 w-4' />
                                {t('settings.presets.saveButton')}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
