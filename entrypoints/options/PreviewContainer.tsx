import { Message, PDFSettings } from './types';
import { ChatLayout } from './ChatLayout';
import { QALayout } from './QALayout';
import { DocumentLayout } from './DocumentLayout';
import { PreviewToolbar } from './PreviewToolbar';

interface PreviewContainerProps {
    messages: Message[] | null;
    settings: PDFSettings;
    currentChatId: number | null;
    chatSaved: boolean;
    chatChanged: boolean;
    onSaveChat: () => void;
    onSaveAsChat: () => void;
    onExportPDF: () => void;
}

export const PreviewContainer = ({
    messages,
    settings,
    currentChatId,
    chatSaved,
    chatChanged,
    onSaveChat,
    onSaveAsChat,
    onExportPDF,
}: PreviewContainerProps) => {
    console.log("Rendering PreviewContainer with settings:", settings);
    return (
        <div className='flex-1 h-full flex flex-col bg-background mt-1'>
            <PreviewToolbar
                currentChatId={currentChatId}
                chatSaved={chatSaved}
                chatChanged={chatChanged}
                onSaveChat={onSaveChat}
                onSaveAsChat={onSaveAsChat}
                onExportPDF={onExportPDF}
            />

            <div
                className='flex-1 overflow-y-auto px-5 pt-8'
            >
                <div
                    id='chat-container'
                    className='mx-auto px-8 shadow-lg relative'
                    style={{
                        maxWidth: '800px',
                        minHeight: '1000px',
                        backgroundColor: 'var(--pdf-background)',
                        color: settings.general.textColor,
                    }}
                >
                    <div className='app-name absolute top-1 left-0 px-4 text-black/50 w-full flex justify-between'>
                        <span>Chat2Pdf</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    {messages && messages.length > 0 ? (
                        settings.layout === 'chat' ? (
                            <ChatLayout messages={messages} settings={settings} />
                        ) : settings.layout === 'qa' ? (
                            <QALayout messages={messages} settings={settings} />
                        ) : (
                            <DocumentLayout messages={messages} settings={settings} />
                        )
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                            No chat data found. Start a conversation to see the preview.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};