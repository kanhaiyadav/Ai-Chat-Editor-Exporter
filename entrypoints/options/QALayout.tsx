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
                        }}
                            className='flex gap-2'
                        >
                            <div style={{
                                fontWeight: 'bold',
                                color: isQuestion ? settings.qa.questionColor : settings.qa.answerColor,
                                fontSize: `${settings.qa.fontSize + 2}px`,
                                fontFamily: settings.general.fontFamily?.value || settings.qa.fontFamily,
                                marginBottom: '8px',
                                whiteSpace: 'nowrap',
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
                            }}
                                className='flex-1 min-w-0'
                            >
                                {
                                    message.content !== '' &&
                                    <div dangerouslySetInnerHTML={{ __html: message.content }} />
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
                        </div>
                    </div>
                );
            })}
        </>
    );
};