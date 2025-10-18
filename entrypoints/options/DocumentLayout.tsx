import { Message, PDFSettings } from './types';

interface DocumentLayoutProps {
    messages: Message[];
    settings: PDFSettings;
}

export const DocumentLayout = ({ messages, settings }: DocumentLayoutProps) => {
    return (
        <>
            <div style={{
                textAlign: 'center',
                padding: '40px 0',
                marginBottom: '10px',
                fontFamily: settings.general.fontFamily?.value || settings.document.fontFamily,
            }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '32px',
                    color: settings.document.titleColor,
                }}>{settings.general.headerText}</h1>
                <p style={{
                    margin: '8px 0 0 0',
                    fontSize: '14px',
                    opacity: 0.7,
                }}>{new Date().toLocaleDateString()}</p>
            </div>
            {messages.map((message, index) => {
                const isTopic = message.role === 'user';
                return (
                    <div key={index} style={{
                        marginBottom: `${settings.document.paragraphSpacing}px`,
                    }}>
                        {
                            message.content !== '' &&
                            <p style={{
                                color: settings.document.bodyColor,
                                fontSize: isTopic ? `${settings.document.fontSize + 3}px` : `${settings.document.fontSize}px`,
                                fontFamily: settings.general.fontFamily?.value || settings.document.fontFamily,
                                lineHeight: settings.document.lineHeight,
                                margin: 0,
                                textAlign: 'justify',
                                fontWeight: isTopic ? '600' : '400',
                                textDecoration: isTopic ? 'underline' : 'none',
                                marginTop: isTopic ? '10px' : '',
                                marginBottom: isTopic ? '-5px' : '',
                            }}>
                                <div dangerouslySetInnerHTML={{ __html: message.content }} />
                            </p>
                        }
                        {
                            message.images && message.images.map((imgSrc, imgIndex) => (
                                <div key={imgIndex} style={{ marginTop: '12px' }}>
                                    <img src={imgSrc} alt={`Image ${imgIndex + 1}`} style={{ maxWidth: '100%' }} />
                                </div>
                            ))  
                        }
                    </div>
                )
            })}
        </>
    );
};