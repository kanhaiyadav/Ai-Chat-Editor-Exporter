import { Message, PDFSettings } from './types';

interface DocumentLayoutProps {
    messages: Message[];
    settings: PDFSettings;
    themeStyles: { bg: string; text: string };
}

export const DocumentLayout = ({ messages, settings, themeStyles }: DocumentLayoutProps) => {
    return (
        <>
            <div style={{
                textAlign: 'center',
                padding: '40px 0',
                marginBottom: '40px',
                fontFamily: settings.document.fontFamily,
            }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '32px',
                    color: settings.document.titleColor,
                }}>{settings.general.headerText}</h1>
                <p style={{
                    margin: '8px 0 0 0',
                    fontSize: '14px',
                    color: themeStyles.text,
                    opacity: 0.7,
                }}>{new Date().toLocaleDateString()}</p>
            </div>
            {messages.map((message, index) => (
                <div key={index} style={{
                    marginBottom: `${settings.document.paragraphSpacing}px`,
                }}>
                    <p style={{
                        color: settings.document.bodyColor,
                        fontSize: `${settings.document.fontSize}px`,
                        fontFamily: settings.document.fontFamily,
                        lineHeight: settings.document.lineHeight,
                        margin: 0,
                        textAlign: 'justify',
                    }}>
                        <div dangerouslySetInnerHTML={{ __html: message.content }} />
                    </p>
                </div>
            ))}
        </>
    );
};