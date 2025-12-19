import { useState, useEffect } from 'react';
import { RotateCcw, Save, SaveAll, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFSettings } from './types';
import { LayoutSelector } from './LayoutSelection';
import { ChatSettings } from './ChatSettings';
import { QASettings } from './QASettings';
import { DocumentSettings } from './DocumentSettings';
import { GeneralSettings } from './GeneralSettings';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, presetOperations } from '@/lib/settingsDB';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SettingsPanelProps {
    settings: PDFSettings;
    expandedSections: { [key: string]: boolean };
    currentPresetId: number | null;
    settingsChanged: boolean;
    presetSaved: boolean;
    onUpdateSettings: (updates: Partial<PDFSettings>) => void;
    onToggleSection: (section: string) => void;
    onResetSettings: () => void;
    onSavePreset: () => void;
    onSaveAsPreset: () => void;
}

export const SettingsPanel = ({
    settings,
    expandedSections,
    currentPresetId,
    settingsChanged,
    presetSaved,
    onUpdateSettings,
    onToggleSection,
    onResetSettings,
    onSavePreset,
    onSaveAsPreset,
}: SettingsPanelProps) => {
    const { t } = useTranslation();
    const [isEditingPresetName, setIsEditingPresetName] = useState(false);
    const [editedPresetName, setEditedPresetName] = useState('');
    const [error, setError] = useState('');

    // Get current preset details
    const currentPreset = useLiveQuery(
        () => currentPresetId ? db.presets.get(currentPresetId) : undefined,
        [currentPresetId]
    );

    useEffect(() => {
        if (currentPreset) {
            setEditedPresetName(currentPreset.name);
        }
    }, [currentPreset]);

    const handleStartEditPresetName = () => {
        if (currentPreset) {
            setIsEditingPresetName(true);
            setEditedPresetName(currentPreset.name);
            setError('');
        }
    };

    const handleSavePresetName = async () => {
        if (!editedPresetName.trim()) {
            setError('Preset name cannot be empty');
            return;
        }

        if (!currentPresetId) return;

        try {
            const exists = await presetOperations.presetNameExists(editedPresetName.trim(), currentPresetId);
            if (exists) {
                setError('A preset with this name already exists');
                return;
            }

            await presetOperations.updatePreset(currentPresetId, editedPresetName.trim(), settings);
            setIsEditingPresetName(false);
            setError('');
        } catch (err) {
            setError('Failed to rename preset');
            console.error(err);
        }
    };

    const handleCancelEditPresetName = () => {
        setIsEditingPresetName(false);
        setError('');
        if (currentPreset) {
            setEditedPresetName(currentPreset.name);
        }
    };

    const presetDisplayName = currentPreset?.name || t('settingsPanel.untitledPreset');

    return (
        <div className='w-[350px] xl:w-[420px] h-full bg-gradient-to-b relative bg-accent mt-1 flex flex-col border border-border'>
            {/* Sticky Header with Preset Name */}
            <div className='sticky top-0 z-10 bg-accent border-b border-border px-6 py-1 pb-[8px]'>
                {isEditingPresetName ? (
                    <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                            <Input
                                value={editedPresetName}
                                autoFocus
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    setEditedPresetName(e.target.value);
                                    setError('');
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSavePresetName();
                                    } else if (e.key === 'Escape') {
                                        handleCancelEditPresetName();
                                    }
                                }}
                                className='h-8 flex-1'
                            />
                            <Button
                                onClick={handleSavePresetName}
                                variant='ghost'
                                size='sm'
                                className='h-8 w-8 p-0'
                            >
                                <Check className='h-4 w-4' />
                            </Button>
                            <Button
                                onClick={handleCancelEditPresetName}
                                variant='ghost'
                                size='sm'
                                className='h-8 w-8 p-0'
                            >
                                <X className='h-4 w-4' />
                            </Button>
                        </div>
                        {error && <p className='text-xs text-destructive'>{error}</p>}
                    </div>
                ) : (
                    <div className='flex items-center justify-between'>
                        {

                            currentPresetId ? (
                                <h3 className='text-sm font-semibold truncate flex-1'
                                    onClick={handleStartEditPresetName}

                                >{presetDisplayName}</h3>
                            ) :
                                <h3 className='text-sm font-semibold truncate flex-1'>{presetDisplayName}</h3>
                        }
                        <div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size={'icon'} variant={'ghost'} onClick={onSavePreset} disabled={currentPresetId === null || !settingsChanged}>
                                        {presetSaved ? (
                                            <Check size={16} className='text-green-500' />
                                        ) : (
                                            <Save size={16} />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{presetSaved ? t('settingsPanel.saved') : t('settingsPanel.save')}</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size={'icon'} variant={'ghost'} onClick={onSaveAsPreset}>
                                        <SaveAll size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('settingsPanel.saveAs')}</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size={'icon'} variant={'ghost'} onClick={onResetSettings}>
                                        <RotateCcw size={14} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('settingsPanel.resetToDefault')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                )}
            </div>

            <div
                className='flex-1 overflow-y-scroll p-6 py-4 space-y-3 pb-24'
                style={{
                    scrollbarColor: '#bebebe var(--color-accent)',
                }}
            >

                <LayoutSelector
                    selectedLayout={settings && settings.layout}
                    onLayoutChange={(layout) => onUpdateSettings({ layout })}
                />

                {settings && settings.layout === 'chat' && (
                    <ChatSettings
                        settings={settings.chat}
                        isExpanded={expandedSections.chatStyle}
                        onToggle={() => onToggleSection('chatStyle')}
                        onUpdate={(updates) => onUpdateSettings({ chat: { ...settings.chat, ...updates } })}
                    />
                )}

                {settings && settings.layout === 'qa' && (
                    <QASettings
                        settings={settings.qa}
                        isExpanded={expandedSections.qaStyle}
                        onToggle={() => onToggleSection('qaStyle')}
                        onUpdate={(updates) => onUpdateSettings({ qa: { ...settings.qa, ...updates } })}
                    />
                )}

                {settings && settings.layout === 'document' && (
                    <DocumentSettings
                        settings={settings.document}
                        isExpanded={expandedSections.documentStyle}
                        onToggle={() => onToggleSection('documentStyle')}
                        onUpdate={(updates) => onUpdateSettings({ document: { ...settings.document, ...updates } })}
                    />
                )}

                <GeneralSettings
                    settings={settings && settings.general}
                    isExpanded={expandedSections.general}
                    onToggle={() => onToggleSection('general')}
                    onUpdate={(updates) => onUpdateSettings({ general: { ...settings.general, ...updates } })}
                />
            </div>
        </div>
    );
};