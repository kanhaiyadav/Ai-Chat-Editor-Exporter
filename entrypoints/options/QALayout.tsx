import { HiDocumentText } from 'react-icons/hi2';
import { Message, PDFSettings } from './types';

interface QALayoutProps {
    messages: Message[];
    settings: PDFSettings;
}

export const QALayout = ({ messages, settings }: QALayoutProps) => {
    let questionNumber = 0;

    return (
        <>
            {settings.general.includeHeader && (
                <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    borderBottom: '2px solid #e5e7eb',
                    marginBottom: '30px',
                    fontFamily: settings.general.fontFamily?.value || settings.qa.fontFamily,
                    color: "#000000",
                }}>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>{settings.general.headerText}</h1>
                </div>
            )}
            {messages.map((message, index) => {
                const isQuestion = message.role === 'user';
                const includeImage = isQuestion ? settings.general.includeUserImages : settings.general.includeAIImages;
                if (isQuestion) questionNumber++;

                const separator = settings.qa.showSeparator && index > 0 && isQuestion ? (
                    <div style={{
                        margin: '24px 0',
                        borderTop: settings.qa.separatorStyle === 'line' ? '1px solid #e5e7eb' :
                            settings.qa.separatorStyle === 'dots' ? '1px dotted #e5e7eb' : 'none',
                    }}></div>
                ) : null;

                return (
                    <div key={index}>
                        {separator}
                        <div style={{
                            marginBottom: '16px',
                            paddingLeft: !isQuestion && settings.qa.indentAnswer ? '24px' : '0',
                            width: '100%',
                            display: 'flex',
                            gap: '8px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                fontWeight: 'bold',
                                color: isQuestion ? settings.qa.questionColor : settings.qa.answerColor,
                                fontSize: `${settings.qa.fontSize + 2}px`,
                                fontFamily: settings.general.fontFamily?.value || settings.qa.fontFamily,
                                marginBottom: '8px',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                            }}>
                                {settings.qa.numbering && isQuestion ? `${questionNumber}. ` : ''}
                                {isQuestion ? settings.qa.questionPrefix : settings.qa.answerPrefix}
                            </div>
                            <div style={{
                                color: isQuestion ? settings.qa.questionColor : settings.qa.answerColor,
                                fontSize: `${settings.qa.fontSize}px`,
                                fontFamily: settings.general.fontFamily?.value || settings.qa.fontFamily,
                                lineHeight: '1.6',
                                fontWeight: isQuestion ? "600" : "400",
                                marginTop: !isQuestion ? "-15px" : "0",
                                flex: 1,
                                minWidth: 0,
                                overflow: 'hidden',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                            }}>
                                {
                                    message.content !== '' &&
                                    <div dangerouslySetInnerHTML={{ __html: message.content }} />
                                }
                                {
                                    includeImage && message.images && message.images.map((imgSrc, imgIndex) => (
                                        <div key={imgIndex} style={{ marginTop: '12px' }}>
                                            <img src={imgSrc} alt={`Image ${imgIndex + 1}`} style={{ maxWidth: '100%', height: 'auto' }} />
                                        </div>
                                    ))
                                }
                                {
                                    settings.general.includeUserAttachments && message.attachments && message.attachments.length > 0 &&
                                    <div style={{ marginTop: '8px' }}>
                                        <p style={{ margin: '0 0 8px 0', fontStyle: 'italic', color: '#4b5563', fontSize: '12px' }}>*Note: we don't support viewing or downloading documents</p>
                                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '-5px' }}>
                                            {
                                                message.attachments.map((attachment, attIndex) => (
                                                    <div key={attIndex} style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f3f4f6', padding: '8px 16px', borderRadius: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', width: 'fit-content' }}>
                                                        <HiDocumentText style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                                                        <span>{attachment.name}</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
};