import { X, Pencil, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { EditorToolbar } from './EditorToolbar';
import { ImageForm, TableForm, LinkForm } from './EditorForms';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { useState, useRef, useEffect } from 'react';

interface EditorPanelProps {
    isOpen: boolean;
    onClose: () => void;
    editingMessageIndex: number | null;
    editingElementRef: HTMLDivElement | null;
    onSaveContent: (index: number, content: string) => void;
    onSaveAndClose: () => void;
}

export const EditorPanel = ({
    isOpen,
    onClose,
    editingMessageIndex,
    editingElementRef,
    onSaveContent,
    onSaveAndClose,
}: EditorPanelProps) => {
    const { t } = useTranslation();

    // Form states for toolbar (image, table, link)
    const [activeForm, setActiveForm] = useState<'image' | 'table' | 'link' | null>(null);
    const [savedRange, setSavedRange] = useState<Range | null>(null);
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

    // Store original content for cancel
    const originalContentRef = useRef<string>('');
    const [hasChanges, setHasChanges] = useState(false);

    // Capture original content when editing starts
    useEffect(() => {
        if (isOpen && editingElementRef && editingMessageIndex !== null) {
            originalContentRef.current = editingElementRef.innerHTML;
            setHasChanges(false);
        }
    }, [isOpen, editingMessageIndex]);

    // Track changes
    useEffect(() => {
        if (!editingElementRef || !isOpen) return;

        const handleInput = () => {
            setHasChanges(editingElementRef.innerHTML !== originalContentRef.current);
        };

        editingElementRef.addEventListener('input', handleInput);
        return () => {
            editingElementRef.removeEventListener('input', handleInput);
        };
    }, [editingElementRef, isOpen]);

    // Add paste event listener to strip formatting when pasting in code blocks
    useEffect(() => {
        if (!editingElementRef || !isOpen) return;

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
    }, [editingElementRef, isOpen]);

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

        // Trigger input event to track changes
        editingElementRef.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const handleSave = () => {
        if (editingElementRef && editingMessageIndex !== null) {
            onSaveContent(editingMessageIndex, editingElementRef.innerHTML);
            originalContentRef.current = editingElementRef.innerHTML;
            setHasChanges(false);
            // Close panel and deactivate edit mode after saving
            onSaveAndClose();
        }
    };

    const handleCancel = () => {
        if (editingElementRef && originalContentRef.current) {
            editingElementRef.innerHTML = originalContentRef.current;
            setHasChanges(false);
        }
        onClose();
    };

    const handleClose = () => {
        if (hasChanges) {
            setShowUnsavedDialog(true);
        } else {
            onClose();
        }
    };

    const handleUnsavedSave = () => {
        setShowUnsavedDialog(false);
        handleSave();
    };

    const handleUnsavedDiscard = () => {
        setShowUnsavedDialog(false);
        // Restore original content
        if (editingElementRef && originalContentRef.current) {
            editingElementRef.innerHTML = originalContentRef.current;
        }
        setHasChanges(false);
        onClose();
    };

    const handleUnsavedCancel = () => {
        setShowUnsavedDialog(false);
    };

    return (
        <>
            {/* Sliding Panel - positioned to overlay settings panel only */}
            <div
                className={`absolute top-0 right-0 h-full w-[350px] xl:w-[420px] bg-background border-l border-border shadow-xl z-20 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className='flex items-center justify-between px-4 py-3 pb-[7px] border-b border-border bg-accent'>
                    <div className='flex items-center gap-2'>
                        <Pencil size={18} />
                        <h2 className='text-sm font-semibold'>{t('editor.panelTitle')}</h2>
                        {editingMessageIndex !== null && (
                            <span className='text-xs text-muted-foreground ml-2'>
                                {t('editor.editingMessage', { number: editingMessageIndex + 1 })}
                            </span>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className='h-8 w-8'
                    >
                        <X size={18} />
                    </Button>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-y-auto p-4'>
                    {editingMessageIndex === null ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Pencil size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">{t('editor.noMessageSelected')}</p>
                            <p className="text-xs mt-2">{t('editor.clickToEdit')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                {t('editor.toolbarDescription')}
                            </div>
                            <EditorToolbar
                                onFormat={(command, value) => {
                                    if (editingElementRef) {
                                        editingElementRef.focus();
                                        setTimeout(() => {
                                            document.execCommand(command, false, value);
                                            // Trigger input event to track changes
                                            editingElementRef.dispatchEvent(new Event('input', { bubbles: true }));
                                        }, 0);
                                    }
                                }}
                                onInsertImage={() => {
                                    saveSelection();
                                    setActiveForm('image');
                                }}
                                onInsertTable={() => {
                                    saveSelection();
                                    setActiveForm('table');
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
                                    setActiveForm('link');
                                }}
                            />

                            {/* Inline Forms */}
                            {activeForm === 'image' && (
                                <ImageForm
                                    onInsert={(html) => {
                                        insertHtmlAtCursor(html);
                                        setActiveForm(null);
                                    }}
                                    onCancel={() => setActiveForm(null)}
                                />
                            )}

                            {activeForm === 'table' && (
                                <TableForm
                                    onInsert={(html) => {
                                        insertHtmlAtCursor(html);
                                        setActiveForm(null);
                                    }}
                                    onCancel={() => setActiveForm(null)}
                                />
                            )}

                            {activeForm === 'link' && (
                                <LinkForm
                                    onInsert={(html) => {
                                        insertHtmlAtCursor(html);
                                        setActiveForm(null);
                                    }}
                                    onCancel={() => setActiveForm(null)}
                                />
                            )}

                            {hasChanges && (
                                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                                    <p className="text-xs text-amber-700 dark:text-amber-300">
                                        {t('editor.unsavedChanges')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer with Save/Cancel buttons */}
                {editingMessageIndex !== null && (
                    <div className="px-4 py-3 border-t border-border bg-accent flex items-center justify-between gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            className="gap-2"
                        >
                            <RotateCcw size={14} />
                            {t('editor.cancel')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={!hasChanges}
                            className="gap-2"
                        >
                            <Save size={14} />
                            {t('editor.saveChanges')}
                        </Button>
                    </div>
                )}
            </div>

            {/* Unsaved Changes Dialog */}
            <UnsavedChangesDialog
                open={showUnsavedDialog}
                onSave={handleUnsavedSave}
                onDiscard={handleUnsavedDiscard}
                onCancel={handleUnsavedCancel}
            />
        </>
    );
};
