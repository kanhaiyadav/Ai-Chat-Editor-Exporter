import { HiDocumentText } from 'react-icons/hi2';
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
                const includeImage = isTopic ? settings.general.includeUserImages : settings.general.includeAIImages;
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
                            includeImage && message.images && message.images.map((imgSrc, imgIndex) => (
                                <div key={imgIndex} style={{ marginTop: '12px' }}>
                                    <img src={imgSrc} alt={`Image ${imgIndex + 1}`} style={{ maxWidth: '100%' }} />
                                </div>
                            ))
                        }
                        {
                            settings.general.includeUserAttachments && message.attachments && message.attachments.length > 0 &&
                            <div className="mt-2">
                                <p className=" italic text-black/70 text-xs">*Note: we don't support viewing or downloading documents</p>
                                <div className="flex gap-3 flex-wrap mt-[-5px]">
                                    {
                                        message.attachments.map((attachment, attIndex) => (
                                            <div key={attIndex} style={{ marginTop: '10px' }} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md shadow w-fit">
                                                <HiDocumentText className="inline-block w-5 h-5 text-black/60" />
                                                <span>{attachment.name}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        }
                    </div>
                )
            })}
        </>
    );
};