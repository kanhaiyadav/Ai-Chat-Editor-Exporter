import { Message, PDFSettings } from './types';
import { ChatLayout } from './ChatLayout';
import { QALayout } from './QALayout';
import { DocumentLayout } from './DocumentLayout';
import { PreviewToolbar } from './PreviewToolbar';
import { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

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
    onMerge: () => void;
    onExportChat?: () => void;
    onCloseChat?: () => void;
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
    onMerge,
    onExportChat,
    onCloseChat,
}: PreviewContainerProps) => {

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

    // Then, replace artifacts AFTER loading is complete
    useEffect(() => {
        // Only run after loading is complete
        if (loading || !artifacts || artifacts.length === 0) return;

        const doc = document.getElementById('chat-container');
        if (!doc) return;

        // Use a longer delay and retry mechanism to ensure DOM is ready
        let attempts = 0;
        const maxAttempts = 5;

        const replaceArtifacts = () => {
            const artifactsHTML = source === 'claude' ? Array.from(
                doc.querySelectorAll("div.artifact-block-cell.group\\/artifact-block")
            ).map((el) => el.closest("div.flex.text-left.font-ui.rounded-lg"))
                .filter(Boolean) : Array.from(
                    doc.querySelectorAll("div.attachment-container")
                )

            console.log("✅ artifactsHTML:", artifactsHTML, "attempts:", attempts);

            // If we found artifacts or exceeded attempts, proceed
            if (artifactsHTML.length > 0 || attempts >= maxAttempts) {
                artifacts.forEach((artifact) => {
                    const index = artifact['artifactIndex'];
                    const artifactHTML = artifactsHTML[index];

                    // Create header
                    const header = document.createElement("div");
                    header.innerHTML = `<div class="flex flex-col gap-1 py-4 min-w-0 flex-1"><div class="leading-tight text-sm line-clamp-1">${artifact.title}</div><div class="text-xs line-clamp-1 text-text-400 opacity-100 transition-opacity duration-200">${artifact.subtitle || ''}</div></div>`;
                    if (header instanceof Element) {
                        header.classList.add("px-4", "bg-accent", "bg-gray-100", "border-b", "border-[#ddd]");
                    }

                    if (artifactHTML) {
                        const artifactDiv = document.createElement("div");
                        artifactDiv.className = "artifact claude-code";

                        // Check if this is code content (from Monaco) or HTML content (from Claude)
                        const isCodeContent = source === 'gemini' || (artifact.type && artifact.type !== 'html' && artifact.type !== 'text');

                        if (isCodeContent) {
                            // Render as code block with syntax highlighting
                            const codeContainer = document.createElement("div");
                            codeContainer.className = "code-artifact-container";
                            codeContainer.style.cssText = "color: #424242; border-radius: 0; overflow-x: auto;";

                            const pre = document.createElement("pre");
                            pre.style.cssText = "margin: 0; padding: 16px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.5;";

                            const code = document.createElement("code");
                            code.className = `language-${artifact.type || 'typescript'}`;
                            code.textContent = artifact.content; // Use textContent to prevent HTML rendering

                            pre.appendChild(code);
                            codeContainer.appendChild(pre);
                            artifactDiv.appendChild(codeContainer);
                        } else {
                            // Render as HTML (for Claude artifacts that are HTML/React)
                            artifactDiv.innerHTML = artifact.content;
                        }

                        if (header) {
                            artifactDiv.prepend(header);
                        }
                        artifactHTML.replaceWith(artifactDiv);
                    }
                });
            } else {
                // Retry after a short delay
                attempts++;
                setTimeout(replaceArtifacts, 150);
            }
        };

        // Initial delay to let React commit DOM
        const timer = setTimeout(replaceArtifacts, 200);

        return () => clearTimeout(timer);
    }, [loading, messages, artifacts]);

    return (
        <div className='flex-1 h-full flex flex-col bg-background mt-1'>
            <PreviewToolbar
                currentChatId={currentChatId}
                chatSaved={chatSaved}
                chatChanged={chatChanged}
                onSaveChat={onSaveChat}
                onSaveAsChat={onSaveAsChat}
                onExportPDF={onExportPDF}
                onMerge={onMerge}
                onExportChat={onExportChat}
                onCloseChat={onCloseChat}
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
                        <span>Chat2Pdf</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    {messages && messages.length > 0 ? (
                        settings && settings.layout === 'chat' ? (
                            <ChatLayout source={source} messages={messages} settings={settings} />
                        ) : settings && settings.layout === 'qa' ? (
                            <QALayout messages={messages} settings={settings} />
                        ) : (
                            <DocumentLayout messages={messages} settings={settings} />
                        )
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
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
        </div>
    );
};