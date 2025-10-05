import { Message, PDFSettings } from './types';
import { ChatLayout } from './ChatLayout';
import { QALayout } from './QALayout';
import { DocumentLayout } from './DocumentLayout';

interface PreviewContainerProps {
    messages: Message[] | null;
    settings: PDFSettings;
    themeStyles: { bg: string; text: string };
}

export const PreviewContainer = ({ messages, settings, themeStyles }: PreviewContainerProps) => {
    return (
        <div className='flex-1 h-full overflow-y-auto bg-background mt-1'>
            <div
                id='chat-container'
                className='mx-auto my-8 p-8 bg-accent shadow-lg'
                style={{
                    maxWidth: '800px',
                    minHeight: '1000px',
                    backgroundColor: themeStyles.bg,
                }}
            >
                {messages && messages.length > 0 ? (
                    settings.layout === 'chat' ? (
                        <ChatLayout messages={messages} settings={settings} themeStyles={themeStyles} />
                    ) : settings.layout === 'qa' ? (
                        <QALayout messages={messages} settings={settings} themeStyles={themeStyles} />
                    ) : (
                        <DocumentLayout messages={messages} settings={settings} themeStyles={themeStyles} />
                    )
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                        No chat data found. Start a conversation to see the preview.
                    </div>
                )}
                {settings.general.includeFooter && settings.general.pageNumbers && (
                    <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        marginTop: '40px',
                        borderTop: '1px solid #e5e7eb',
                        fontSize: '12px',
                        color: themeStyles.text,
                        opacity: 0.6,
                    }}>
                        Page 1
                    </div>
                )}
            </div>
        </div>
    );
};