import { useState, useEffect, useRef } from 'react';
import { RotateCcw, Save, SaveAll, Pencil, Check, X, Upload, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { PDFSettings, Message } from './types';
import { LayoutSelector } from './LayoutSelection';
import { ChatSettings } from './ChatSettings';
import { QASettings } from './QASettings';
import { DocumentSettings } from './DocumentSettings';
import { GeneralSettings } from './GeneralSettings';
import { MessageManagement } from './MessageManagement';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, presetOperations } from '@/lib/settingsDB';
import { ChatEditor } from './Editor';
import { EditorToolbar } from './EditorToolbar';
import { ImageDialog, TableDialog, LinkDialog } from './EditorDialogs';
import { useTranslation } from 'react-i18next';

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
    editingMessageIndex: number | null;
    editingElementRef: HTMLDivElement | null;
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
    editingMessageIndex,
    editingElementRef,
}: SettingsPanelProps) => {
    const { t } = useTranslation();
    const [isEditingPresetName, setIsEditingPresetName] = useState(false);
    const [editedPresetName, setEditedPresetName] = useState('');
    const [error, setError] = useState('');

    // Dialog states for toolbar
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [tableDialogOpen, setTableDialogOpen] = useState(false);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [savedRange, setSavedRange] = useState<Range | null>(null);

    const saveSelection = () => {
        if (!editingElementRef) return;
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (editingElementRef.contains(range.commonAncestorContainer)) {
                setSavedRange(range.cloneRange());
            }
        }
    };

    // Helper function to insert HTML at cursor position
    const insertHtmlAtCursor = (html: string) => {
        if (!editingElementRef) return;

        editingElementRef.focus();

        const selection = window.getSelection();
        if (!selection) return;

        if (savedRange) {
            selection.removeAllRanges();
            selection.addRange(savedRange);
            setSavedRange(null);
        } else if (selection.rangeCount === 0) {
            // If no selection, append at the end
            const range = document.createRange();
            range.selectNodeContents(editingElementRef);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        // Try document.execCommand first
        const success = document.execCommand('insertHTML', false, html);

        // If execCommand fails, manually insert
        if (!success && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            const frag = document.createDocumentFragment();
            let node;
            while ((node = tempDiv.firstChild)) {
                frag.appendChild(node);
            }

            range.insertNode(frag);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        // Trigger input event to save changes / React listeners
        const inputEvent = typeof InputEvent !== 'undefined'
            ? new InputEvent('input', { bubbles: true, cancelable: true, data: html })
            : new Event('input', { bubbles: true });
        editingElementRef.dispatchEvent(inputEvent);

        // Ensure message state updates even if synthetic events don't fire
        if (editingMessageIndex !== null) {
            onUpdateMessage(editingMessageIndex, editingElementRef.innerHTML);
        }
    };

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

    // Add paste event listener to strip formatting when pasting in code blocks
    useEffect(() => {
        if (!editingElementRef) return;

        const handlePaste = (e: ClipboardEvent) => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            // Check if cursor is inside a code element
            let node = selection.anchorNode;
            let isInCode = false;
            while (node && node !== editingElementRef) {
                if (node.nodeName === 'CODE' || (node as Element).tagName === 'CODE') {
                    isInCode = true;
                    break;
                }
                node = node.parentNode;
            }

            if (isInCode) {
                e.preventDefault();
                e.stopPropagation();
                const text = e.clipboardData?.getData('text/plain') || '';
                document.execCommand('insertText', false, text);
            }
        };

        editingElementRef.addEventListener('paste', handlePaste as EventListener);

        return () => {
            editingElementRef.removeEventListener('paste', handlePaste as EventListener);
        };
    }, [editingElementRef]);

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

                <MessageManagement
                    messages={messages}
                    isExpanded={expandedSections.messages}
                    onToggle={() => onToggleSection('messages')}
                    onUpdateMessage={onUpdateMessage}
                    onToggleMessage={onToggleMessage}
                    onReorderMessages={onReorderMessages}
                    selectedMessages={selectedMessages}
                />

                {/* Editor Toolbar - Always visible */}
                <Card className="shadow-sm border border-gray-200 gap-1">
                    <CardHeader className="px-4">
                        <CardTitle className="flex items-center justify-between font-semibold text-sm">
                            <span className="flex items-center gap-2">
                                <Pencil size={16} />
                                {t('settingsPanel.editorToolbar')}
                            </span>
                            {editingMessageIndex !== null && (
                                <span className='text-xs font-normal text-muted-foreground'>
                                    Editing Message #{editingMessageIndex + 1}
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-2~">
                        <EditorToolbar
                            onFormat={(command, value) => {
                                if (editingElementRef) {
                                    editingElementRef.focus();
                                    setTimeout(() => {
                                        document.execCommand(command, false, value);
                                    }, 0);
                                }
                            }}
                            onInsertImage={() => {
                                saveSelection();
                                setImageDialogOpen(true);
                            }}
                            onInsertTable={() => {
                                saveSelection();
                                setTableDialogOpen(true);
                            }}
                            onInsertCodeBlock={() => {
                                if (editingElementRef) {
                                    const codeHTML = `<pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; font-family: monospace;"><code><br></code></pre>`;
                                    insertHtmlAtCursor(codeHTML);

                                    // Focus and place cursor inside the code element
                                    setTimeout(() => {
                                        const pre = editingElementRef.querySelector('pre:last-of-type');
                                        const code = pre?.querySelector('code');
                                        if (code) {
                                            const range = document.createRange();
                                            const selection = window.getSelection();
                                            range.setStart(code, 0);
                                            range.collapse(true);
                                            selection?.removeAllRanges();
                                            selection?.addRange(range);
                                            editingElementRef.focus();
                                        }
                                    }, 10);
                                }
                            }}
                            onInsertLink={() => {
                                saveSelection();
                                setLinkDialogOpen(true);
                            }}
                        />
                    </CardContent>
                </Card>
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
                                {t('settingsPanel.save')}
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
                        {t('settingsPanel.saveAs')}
                    </Button>
                </div>

                <Button
                    onClick={onResetSettings}
                    variant="outline"
                    className="w-full"
                    size="lg"
                >
                    <RotateCcw size={14} className='mr-1' />
                    {t('settingsPanel.resetToDefault')}
                </Button>
            </div>

            {/* Editor Dialogs */}
            <ImageDialog
                open={imageDialogOpen}
                onOpenChange={setImageDialogOpen}
                onInsert={(html) => {
                    insertHtmlAtCursor(html);
                }}
            />
            <TableDialog
                open={tableDialogOpen}
                onOpenChange={setTableDialogOpen}
                onInsert={(html) => {
                    insertHtmlAtCursor(html);
                }}
            />
            <LinkDialog
                open={linkDialogOpen}
                onOpenChange={setLinkDialogOpen}
                onInsert={(html) => {
                    insertHtmlAtCursor(html);
                }}
            />
        </div>
    );
};