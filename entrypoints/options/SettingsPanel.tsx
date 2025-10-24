import { useState, useEffect } from 'react';
import { RotateCcw, Save, SaveAll, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFSettings, Message } from './types';
import { LayoutSelector } from './LayoutSelection';
import { ChatSettings } from './ChatSettings';
import { QASettings } from './QASettings';
import { DocumentSettings } from './DocumentSettings';
import { GeneralSettings } from './GeneralSettings';
import { MessageManagement } from './MessageManagement';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, presetOperations } from '@/lib/settingsDB';

interface SettingsPanelProps {
    settings: PDFSettings;
    expandedSections: { [key: string]: boolean };
    messages: Message[] | null;
    selectedMessages: Set<number>;
    currentPresetId: number | null;
    settingsChanged: boolean;
    presetSaved: boolean;
    onUpdateSettings: (updates: Partial<PDFSettings>) => void;
    onToggleSection: (section: string) => void;
    onResetSettings: () => void;
    onUpdateMessage: (index: number, content: string) => void;
    onToggleMessage: (index: number) => void;
    onReorderMessages: (newOrder: Message[]) => void;
    onSavePreset: () => void;
    onSaveAsPreset: () => void;
}

export const SettingsPanel = ({
    settings,
    expandedSections,
    messages,
    selectedMessages,
    currentPresetId,
    settingsChanged,
    presetSaved,
    onUpdateSettings,
    onToggleSection,
    onResetSettings,
    onUpdateMessage,
    onToggleMessage,
    onReorderMessages,
    onSavePreset,
    onSaveAsPreset,
}: SettingsPanelProps) => {
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

    const presetDisplayName = currentPreset?.name || 'Untitled Settings Preset';

    return (
        <div className='w-[350px] xl:w-[420px] h-full bg-gradient-to-b relative bg-accent mt-1 flex flex-col border border-border'>
            {/* Sticky Header with Preset Name */}
            <div className='sticky top-0 z-10 bg-accent border-b border-border px-6 py-3 pb-[15px]'>
                {isEditingPresetName ? (
                    <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                            <Input
                                value={editedPresetName}
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
                                autoFocus
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
                        <h3 className='text-sm font-semibold truncate flex-1'>{presetDisplayName}</h3>
                        {currentPresetId && (
                            <div
                                onClick={handleStartEditPresetName}
                                className='p-0 ml-2'
                            >
                                <Pencil size={15} />
                            </div>
                        )}
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
                    selectedLayout={settings.layout}
                    onLayoutChange={(layout) => onUpdateSettings({ layout })}
                />

                {settings.layout === 'chat' && (
                    <ChatSettings
                        settings={settings.chat}
                        isExpanded={expandedSections.chatStyle}
                        onToggle={() => onToggleSection('chatStyle')}
                        onUpdate={(updates) => onUpdateSettings({ chat: { ...settings.chat, ...updates } })}
                    />
                )}

                {settings.layout === 'qa' && (
                    <QASettings
                        settings={settings.qa}
                        isExpanded={expandedSections.qaStyle}
                        onToggle={() => onToggleSection('qaStyle')}
                        onUpdate={(updates) => onUpdateSettings({ qa: { ...settings.qa, ...updates } })}
                    />
                )}

                {settings.layout === 'document' && (
                    <DocumentSettings
                        settings={settings.document}
                        isExpanded={expandedSections.documentStyle}
                        onToggle={() => onToggleSection('documentStyle')}
                        onUpdate={(updates) => onUpdateSettings({ document: { ...settings.document, ...updates } })}
                    />
                )}

                <GeneralSettings
                    settings={settings.general}
                    isExpanded={expandedSections.general}
                    onToggle={() => onToggleSection('general')}
                    onUpdate={(updates) => onUpdateSettings({ general: { ...settings.general, ...updates } })}
                />

                <MessageManagement
                    messages={messages}
                    isExpanded={expandedSections.messages}
                    onToggle={() => onToggleSection('messages')}
                    onUpdateMessage={onUpdateMessage}
                    onToggleMessage={onToggleMessage}
                    onReorderMessages={onReorderMessages}
                    selectedMessages={selectedMessages}
                />
            </div>

            {/* Fixed Button Bar */}
            <div className='flex flex-col gap-2 w-full bg-accent py-4 px-6 mt-auto shadow-lg border-t border-border'>
                <div className='flex items-center gap-2 w-full'>
                    <Button
                        onClick={onSavePreset}
                        variant="default"
                        className="flex-1"
                        size="lg"
                        disabled={currentPresetId === null || !settingsChanged}
                    >
                        {presetSaved ? (
                            <>
                                <Check size={16} className='mr-1 text-green-500' />
                                Saved
                            </>
                        ) : (
                            <>
                                <Save size={16} className='mr-1' />
                                Save
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={onSaveAsPreset}
                        variant="secondary"
                        className="flex-1"
                        size="lg"
                    >
                        <SaveAll size={16} className='mr-1' />
                        Save As
                    </Button>
                </div>

                <Button
                    onClick={onResetSettings}
                    variant="outline"
                    className="w-full"
                    size="lg"
                >
                    <RotateCcw size={14} className='mr-1' />
                    Reset to Default
                </Button>
            </div>
        </div>
    );
};