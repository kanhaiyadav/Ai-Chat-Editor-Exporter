import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFSettings, Message } from './types';
import { LayoutSelector } from './LayoutSelection';
import { ChatSettings } from './ChatSettings';
import { QASettings } from './QASettings';
import { DocumentSettings } from './DocumentSettings';
import { GeneralSettings } from './GeneralSettings';
import { MessageManagement } from './MessageManagement';

interface SettingsPanelProps {
    settings: PDFSettings;
    expandedSections: { [key: string]: boolean };
    messages: Message[] | null;
    selectedMessages: Set<number>;
    onUpdateSettings: (updates: Partial<PDFSettings>) => void;
    onToggleSection: (section: string) => void;
    onResetSettings: () => void;
    onGeneratePDF: () => void;
    onUpdateMessage: (index: number, content: string) => void;
    onToggleMessage: (index: number) => void;
}

export const SettingsPanel = ({
    settings,
    expandedSections,
    messages,
    selectedMessages,
    onUpdateSettings,
    onToggleSection,
    onResetSettings,
    onGeneratePDF,
    onUpdateMessage,
    onToggleMessage,
}: SettingsPanelProps) => {
    return (
        <div className='w-[420px] h-full bg-gradient-to-b relative bg-accent dark:bg-accent border-l border-amber-200 mt-1 flex flex-col'>
            <div
                className='flex-1 overflow-y-auto p-6 py-4 space-y-3 pb-24'
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
                    selectedMessages={selectedMessages}
                />
            </div>

            {/* Fixed Button Bar */}
            <div className='flex items-center gap-4 w-full bg-accent backdrop-blur-md py-4 px-6 border-t-[1px] border-amber-300 mt-auto'>
                <Button
                    onClick={onGeneratePDF}
                    size="lg"
                    className='flex-1'
                >
                    Export as PDF
                </Button>

                <Button
                    onClick={onResetSettings}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                >
                    <RotateCcw size={16} />
                    Reset to Default
                </Button>
            </div>
        </div>
    );
};