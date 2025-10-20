import { RotateCcw, Save, SaveAll } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFSettings, Message } from './types';
import { LayoutSelector } from './LayoutSelection';
import { ChatSettings } from './ChatSettings';
import { QASettings } from './QASettings';
import { DocumentSettings } from './DocumentSettings';
import { GeneralSettings } from './GeneralSettings';
import { MessageManagement } from './MessageManagement';
import { PresetManagement } from './PresetManagement';

interface SettingsPanelProps {
    settings: PDFSettings;
    expandedSections: { [key: string]: boolean };
    messages: Message[] | null;
    selectedMessages: Set<number>;
    currentPresetId: number | null;
    onUpdateSettings: (updates: Partial<PDFSettings>) => void;
    onToggleSection: (section: string) => void;
    onResetSettings: () => void;
    onUpdateMessage: (index: number, content: string) => void;
    onToggleMessage: (index: number) => void;
    onReorderMessages: (newOrder: Message[]) => void;
    onLoadPreset: (settings: PDFSettings, presetId: number) => void;
    onSavePreset: () => void;
    onSaveAsPreset: () => void;
}

export const SettingsPanel = ({
    settings,
    expandedSections,
    messages,
    selectedMessages,
    currentPresetId,
    onUpdateSettings,
    onToggleSection,
    onResetSettings,
    onUpdateMessage,
    onToggleMessage,
    onReorderMessages,
    onLoadPreset,
    onSavePreset,
    onSaveAsPreset,
}: SettingsPanelProps) => {
    return (
        <div className='w-[350px] xl:w-[420px] h-full bg-gradient-to-b relative bg-accent mt-1 flex flex-col border'>
            <div
                className='flex-1 overflow-y-scroll p-6 py-4 space-y-3 pb-24'
                style={{
                    scrollbarColor: '#bebebe var(--color-accent)',
                }}
            >
                <PresetManagement
                    currentSettings={settings}
                    isExpanded={expandedSections.presets}
                    onToggle={() => onToggleSection('presets')}
                    onLoadPreset={onLoadPreset}
                />

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
            <div className='flex flex-col gap-2 w-full bg-accent py-4 px-6 mt-auto shadow-lg border-t'>
                {currentPresetId !== null ? (
                    <div className='flex items-center gap-2 w-full'>
                        <Button
                            onClick={onSavePreset}
                            variant="default"
                            className="flex-1"
                            size="lg"
                        >
                            <Save size={16} className='mr-1' />
                            Save Preset
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
                ) : (
                    <Button
                        onClick={onSavePreset}
                        variant="default"
                        className="w-full"
                        size="lg"
                    >
                        <Save size={16} className='mr-1' />
                        Save as Preset
                    </Button>
                )}

                <Button
                    onClick={onResetSettings}
                    variant="outline"
                    className="w-full"
                    size="sm"
                >
                    <RotateCcw size={14} className='mr-1' />
                    Reset to Default
                </Button>
            </div>
        </div>
    );
};