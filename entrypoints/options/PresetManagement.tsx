import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Save, FolderOpen, Trash2, Copy, Pencil, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card } from '@/components/ui/card';
import { PDFSettings } from './types';
import { SavedPreset, presetOperations, db } from '@/lib/settingsDB';

interface PresetManagementProps {
    currentSettings: PDFSettings;
    isExpanded: boolean;
    onToggle: () => void;
    onLoadPreset: (settings: PDFSettings, presetId: number) => void;
}

export const PresetManagement = ({
    currentSettings,
    isExpanded,
    onToggle,
    onLoadPreset,
}: PresetManagementProps) => {
    // Use useLiveQuery for automatic refresh
    const presets = useLiveQuery(
        () => db.presets.orderBy('updatedAt').reverse().toArray(),
        []
    );

    const [newPresetName, setNewPresetName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSavePreset = async () => {
        if (!newPresetName.trim()) {
            setError('Please enter a preset name');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const exists = await presetOperations.presetNameExists(newPresetName.trim());
            if (exists) {
                setError('A preset with this name already exists');
                setSaving(false);
                return;
            }

            await presetOperations.savePreset(newPresetName.trim(), currentSettings);
            setNewPresetName('');
            // No need to call loadPresets() - useLiveQuery will auto-refresh
        } catch (err) {
            setError('Failed to save preset');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleLoadPreset = (preset: SavedPreset) => {
        onLoadPreset(preset.settings, preset.id!);
    };

    const handleDeletePreset = async (id: number) => {
        if (confirm('Are you sure you want to delete this preset?')) {
            await presetOperations.deletePreset(id);
            // No need to call loadPresets() - useLiveQuery will auto-refresh
        }
    };

    const handleStartEdit = (preset: SavedPreset) => {
        setEditingId(preset.id!);
        setEditingName(preset.name);
        setError('');
    };

    const handleSaveEdit = async (id: number) => {
        if (!editingName.trim()) {
            setError('Preset name cannot be empty');
            return;
        }

        const exists = await presetOperations.presetNameExists(editingName.trim(), id);
        if (exists) {
            setError('A preset with this name already exists');
            return;
        }

        const preset = presets?.find(p => p.id === id);
        if (preset) {
            await presetOperations.updatePreset(id, editingName.trim(), preset.settings);
            setEditingId(null);
            setEditingName('');
            setError('');
            // No need to call loadPresets() - useLiveQuery will auto-refresh
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName('');
        setError('');
    };

    const handleDuplicatePreset = async (preset: SavedPreset) => {
        let baseName = `${preset.name} (Copy)`;
        let newName = baseName;
        let counter = 1;

        while (await presetOperations.presetNameExists(newName)) {
            newName = `${baseName} ${counter}`;
            counter++;
        }

        await presetOperations.duplicatePreset(preset.id!, newName);
        // No need to call loadPresets() - useLiveQuery will auto-refresh
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
                <CollapsibleTrigger className='flex w-full items-center justify-between px-4 py-1 hover:bg-accent/50 transition-colors rounded-t-lg'>
                    <div className='flex items-center gap-2'>
                        <FolderOpen size={25} />
                        <div className='flex flex-col items-start mt-[-3px]'>
                            <span className='font-medium'>Saved Presets</span>
                            <span className='text-xs mt-[-3px] text-muted-foreground'>
                                {presets?.length || 0} saved
                            </span>
                        </div>
                    </div>
                    <div>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent className='px-4 pb-4 space-y-4'>
                    {/* Save New Preset Section */}
                    <div className='space-y-2 pt-2'>
                        <Label htmlFor='preset-name' className='text-sm font-medium'>
                            Save Current Settings
                        </Label>
                        <div className='flex gap-2'>
                            <Input
                                id='preset-name'
                                placeholder='Enter preset name...'
                                value={newPresetName}
                                onChange={(e) => {
                                    setNewPresetName(e.target.value);
                                    setError('');
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSavePreset();
                                    }
                                }}
                                className='flex-1'
                            />
                            <Button
                                onClick={handleSavePreset}
                                disabled={saving || !newPresetName.trim()}
                                size='sm'
                            >
                                <Save className='h-4 w-4' />
                            </Button>
                        </div>
                        {error && (
                            <p className='text-xs text-destructive'>{error}</p>
                        )}
                    </div>

                    {/* Presets List */}
                    {presets && presets.length > 0 && (
                        <div className='space-y-2'>
                            <Label className='text-sm font-medium'>Saved Presets</Label>
                            <div className='space-y-2 max-h-64 overflow-y-auto pr-1'>
                                {presets.map((preset) => (
                                    <div
                                        key={preset.id}
                                        className='group flex items-center gap-2 p-2 rounded-md bg-accent/30 hover:bg-accent/60 transition-colors border border-border/20'
                                    >
                                        {editingId === preset.id ? (
                                            <>
                                                <Input
                                                    value={editingName}
                                                    onChange={(e) => {
                                                        setEditingName(e.target.value);
                                                        setError('');
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleSaveEdit(preset.id!);
                                                        } else if (e.key === 'Escape') {
                                                            handleCancelEdit();
                                                        }
                                                    }}
                                                    className='flex-1 h-8'
                                                    autoFocus
                                                />
                                                <Button
                                                    onClick={() => handleSaveEdit(preset.id!)}
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
                                                    onClick={() => handleLoadPreset(preset)}
                                                >
                                                    <p className='text-sm font-medium'>
                                                        {preset.name}
                                                    </p>
                                                    <p className='text-xs text-muted-foreground'>
                                                        Updated: {formatDate(preset.updatedAt)}
                                                    </p>
                                                </div>
                                                <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                                    <Button
                                                        onClick={() => handleStartEdit(preset)}
                                                        variant='ghost'
                                                        size='sm'
                                                        className='h-8 w-8 p-0'
                                                        title='Rename'
                                                    >
                                                        <Pencil className='h-3.5 w-3.5' />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDuplicatePreset(preset)}
                                                        variant='ghost'
                                                        size='sm'
                                                        className='h-8 w-8 p-0'
                                                        title='Duplicate'
                                                    >
                                                        <Copy className='h-3.5 w-3.5' />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDeletePreset(preset.id!)}
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
                        </div>
                    )}

                    {(!presets || presets.length === 0) && (
                        <div className='text-center py-6 text-sm text-muted-foreground'>
                            <FolderOpen className='h-12 w-12 mx-auto mb-2 opacity-50' />
                            <p>No saved presets yet</p>
                            <p className='text-xs mt-1'>
                                Save your current settings to quickly apply them later
                            </p>
                        </div>
                    )}
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
