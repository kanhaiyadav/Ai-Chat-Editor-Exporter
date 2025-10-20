import { Message, PDFSettings } from './types';
import { ChatLayout } from './ChatLayout';
import { QALayout } from './QALayout';
import { DocumentLayout } from './DocumentLayout';
import { PreviewToolbar } from './PreviewToolbar';

interface PreviewContainerProps {
    messages: Message[] | null;
    settings: PDFSettings;
    currentChatId: number | null;
    zoom: number;
    onSaveChat: () => void;
    onSaveAsChat: () => void;
    onExportPDF: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
}

export const PreviewContainer = ({
    messages,
    settings,
    currentChatId,
    zoom,
    onSaveChat,
    onSaveAsChat,
    onExportPDF,
    onZoomIn,
    onZoomOut,
    onResetZoom,
}: PreviewContainerProps) => {
    console.log("Rendering PreviewContainer with settings:", settings);
    return (
        <div className='flex-1 h-full flex flex-col bg-background mt-1'>
            <PreviewToolbar
                currentChatId={currentChatId}
                zoom={zoom}
                onSaveChat={onSaveChat}
                onSaveAsChat={onSaveAsChat}
                onExportPDF={onExportPDF}
                onZoomIn={onZoomIn}
                onZoomOut={onZoomOut}
                onResetZoom={onResetZoom}
            />

            <div
                className='flex-1 overflow-y-auto px-5'
                style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.2s ease-in-out',
                    boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.1)",
                }}
            >
                <div
                    id='chat-container'
                    className='mx-auto my-8 p-8 bg-accent shadow-lg relative'
                    style={{
                        maxWidth: '800px',
                        minHeight: '1000px',
                        backgroundColor: settings.general.backgroundColor,
                        color: settings.general.textColor,
                    }}
                >
                    <div className='absolute top-1 left-0 px-4 text-black/50 w-full flex justify-between'>
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