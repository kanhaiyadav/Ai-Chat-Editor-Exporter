import { Message, PDFSettings } from './types';
import { ChatLayout } from './ChatLayout';
import { QALayout } from './QALayout';
import { DocumentLayout } from './DocumentLayout';
import { PreviewToolbar } from './PreviewToolbar';
import { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import { FiEdit } from "react-icons/fi";

interface PreviewContainerProps {
    source: 'chatgpt' | 'claude' | 'deepseek' | 'gemini';
    messages: Message[] | null;
    settings: PDFSettings;
    currentChatId: number | null;
    artifacts: Array<any>;
    chatSaved: boolean;
    chatChanged: boolean;
    onSaveChat: () => void;
    onSaveAsChat: () => void;
    onExportPDF: () => void;
    onOpenInWord: () => void;
    onExportMarkdown: () => void;
    onExportHTML: () => void;
    onExportPlainText: () => void;
    onExportJSON: () => void;
    onMerge: () => void;
    onCloseChat?: () => void;
    onManageMessages?: () => void;
    editingIndex: number | null;
    onStartEdit: (index: number, element?: HTMLDivElement) => void;
    onContentChange: (index: number, content: string) => void;
    onFinishEdit: () => void;
    isEditingContent?: boolean;
    onToggleEditContent?: () => void;
}

export const PreviewContainer = ({
    source,
    messages,
    settings,
    currentChatId,
    artifacts,
    chatSaved,
    chatChanged,
    onSaveChat,
    onSaveAsChat,
    onExportPDF,
    onOpenInWord,
    onExportMarkdown,
    onExportHTML,
    onExportPlainText,
    onExportJSON,
    onMerge,
    onCloseChat,
    onManageMessages,
    editingIndex,
    onStartEdit,
    onContentChange,
    onFinishEdit,
    isEditingContent,
    onToggleEditContent,
}: PreviewContainerProps) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [prevMessageCount, setPrevMessageCount] = useState(0);

    // Handle loading state - only show loading when message count changes significantly
    // Don't show loading for reorders (same count) or small changes (like editing)
    useEffect(() => {
        const currentCount = messages?.length || 0;

        // Only trigger loading if:
        // 1. Going from no messages to messages, or
        // 2. Message count changed by more than 1 (not just editing/reordering)
        if (prevMessageCount === 0 && currentCount > 0) {
            setLoading(true);
            const timer = setTimeout(() => {
                setLoading(false);
                setPrevMessageCount(currentCount);
            }, 800);
            return () => clearTimeout(timer);
        } else {
            // For reorders, edits, or small changes, no loading state
            setPrevMessageCount(currentCount);
            setLoading(false);
        }
    }, [messages]);

    // Replace artifacts AFTER loading is complete (only for single artifact exports)
    useEffect(() => {
        // Only run if there are actually artifacts to replace (single artifact exports)
        if (loading || !artifacts || artifacts.length === 0) return;

        const doc = document.getElementById('chat-container');
        if (!doc) return;

        const replaceArtifacts = () => {
            // For Claude: find artifact placeholders
            // For Gemini: artifacts are already rendered in the message content
            const artifactsHTML = source === 'claude'
                ? Array.from(doc.querySelectorAll("div.artifact-block-cell.group\\/artifact-block"))
                    .map((el) => el.closest("div.flex.text-left.font-ui.rounded-lg"))
                    .filter(Boolean)
                : [];

            // Only Claude artifacts need replacement since Gemini artifacts are in message content
            if (source === 'claude' && artifactsHTML.length > 0) {
                artifacts.forEach((artifact) => {
                    const index = artifact['artifactIndex'];
                    const artifactHTML = artifactsHTML[index];

                    if (artifactHTML) {
                        // Create header
                        const header = document.createElement("div");
                        header.innerHTML = `<div class="flex flex-col gap-1 py-4 min-w-0 flex-1"><div class="leading-tight text-sm line-clamp-1">${artifact.title}</div><div class="text-xs line-clamp-1 text-text-400 opacity-100 transition-opacity duration-200">${artifact.subtitle || ''}</div></div>`;
                        header.classList.add("px-4", "bg-accent", "bg-gray-100", "border-b", "border-[#ddd]");

                        const artifactDiv = document.createElement("div");
                        artifactDiv.className = "artifact claude-code";
                        artifactDiv.innerHTML = artifact.content;

                        if (header) {
                            artifactDiv.prepend(header);
                        }
                        artifactHTML.replaceWith(artifactDiv);
                    }
                });
            }
        };

        // Small delay to let React commit DOM
        const timer = setTimeout(replaceArtifacts, 100);

        return () => clearTimeout(timer);
    }, [loading, messages, artifacts, source]);

    return (
        <div className='flex-1 h-full flex flex-col bg-background mt-1 relative'>
            <PreviewToolbar
                currentChatId={currentChatId}
                chatSaved={chatSaved}
                chatChanged={chatChanged}
                onSaveChat={onSaveChat}
                onSaveAsChat={onSaveAsChat}
                onExportPDF={onExportPDF}
                onOpenInWord={onOpenInWord}
                onExportMarkdown={onExportMarkdown}
                onExportHTML={onExportHTML}
                onExportPlainText={onExportPlainText}
                onExportJSON={onExportJSON}
                onMerge={onMerge}
                onCloseChat={onCloseChat}
                onManageMessages={onManageMessages}
            />

            <div
                className='flex-1 overflow-y-auto px-5 pt-8'
            >
                <div
                    id='chat-container'
                    className={`mx-auto px-8 shadow-lg relative pt-10 ${source} `}
                    style={{
                        maxWidth: '800px',
                        minHeight: '1000px',
                        backgroundColor: 'var(--pdf-background)',
                        color: settings && settings.general.textColor,
                    }}
                >
                    <div className='app-name absolute top-1 left-0 px-4 text-black/50 w-full flex justify-between'>
                        <span>ExportMyChat</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    {messages && messages.length > 0 ? (
                        settings && settings.layout === 'chat' ? (
                            <ChatLayout
                                source={source}
                                messages={messages}
                                settings={settings}
                                editingIndex={editingIndex}
                                onStartEdit={onStartEdit}
                                onContentChange={onContentChange}
                                onFinishEdit={onFinishEdit}
                                isEditingContent={isEditingContent}
                            />
                        ) : settings && settings.layout === 'qa' ? (
                            <QALayout
                                messages={messages}
                                settings={settings}
                                editingIndex={editingIndex}
                                onStartEdit={onStartEdit}
                                onContentChange={onContentChange}
                                onFinishEdit={onFinishEdit}
                                isEditingContent={isEditingContent}
                            />
                        ) : (
                            <DocumentLayout
                                messages={messages}
                                settings={settings}
                                editingIndex={editingIndex}
                                onStartEdit={onStartEdit}
                                onContentChange={onContentChange}
                                onFinishEdit={onFinishEdit}
                                isEditingContent={isEditingContent}
                            />
                        )
                    ) : (
                        <div className='text-center p-[40px] text-[#9ca3af] flex flex-col items-center'>
                            <img src="/empty.png" alt="" className='w-[300px] h-auto' />
                            <p>If you think this is unexpected,</p>
                            <p className='!mt-[-10px]'>make sure you click on the export chat button on the chat page <br /> only after the chat page has fully loaded.</p>
                        </div>
                    )}

                    <div className={`glass rounded-none absolute top-0 left-0 right-0 bottom-0 flex justify-center ${loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity duration-500`}>
                        <div className='flex flex-col items-center justify-center gap-2 mt-[150px] p-4 h-fit'>
                            <Spinner className="text-primary w-12 h-12" />
                            <div className='text-black/70 text-base'>Generating Preview...</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Edit Content Button */}
            {messages && messages.length > 0 && (
                <div
                    className={`absolute bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${isEditingContent ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'
                        }`}
                >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={onToggleEditContent}
                                size="lg"
                                className="gap-2 shadow-2xl hover:shadow-xl transition-shadow rounded-full h-13 px-6"
                            >
                                <FiEdit className="w-6 h-6" />
                                {t('preview.editContent')}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>{t('preview.editContentTooltipOff')}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            )}
        </div>
    );
};