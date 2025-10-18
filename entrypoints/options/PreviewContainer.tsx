import { Message, PDFSettings } from './types';
import { ChatLayout } from './ChatLayout';
import { QALayout } from './QALayout';
import { DocumentLayout } from './DocumentLayout';

interface PreviewContainerProps {
    messages: Message[] | null;
    settings: PDFSettings;
}

export const PreviewContainer = ({ messages, settings }: PreviewContainerProps) => {
    console.log("Rendering PreviewContainer with settings:", settings);
    return (
        <div className='flex-1 h-full overflow-y-auto bg-background mt-1 px-5'>
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
                    <span>{ new Date().toLocaleDateString() }</span>
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
    );
};