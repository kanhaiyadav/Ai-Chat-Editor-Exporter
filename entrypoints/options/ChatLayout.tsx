import { HiOutlineUserCircle } from "react-icons/hi2";
import { Message, PDFSettings } from './types';
import { HiDocumentText } from "react-icons/hi";
import { decodeHTMLEntities } from './utils';

interface ChatLayoutProps {
    source: 'chatgpt' | 'claude' | 'deepseek' | 'gemini';
    messages: Message[];
    settings: PDFSettings;
}

export const ChatLayout = ({ messages, settings, source }: ChatLayoutProps) => {

    return (
        <>
            {settings.general.includeHeader && (
                <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    paddingTop: '0',
                    borderBottom: '2px solid #e5e7eb',
                    marginBottom: '20px',
                    fontFamily: settings.general.fontFamily?.value || settings.chat.fontFamily,
                }}>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>{settings.general.headerText}</h1>
                </div>
            )}
            {messages.map((message, index) => {
                const isUser = message.role === 'user';
                const bubbleColor = isUser ? settings.chat.userBubbleColor : settings.chat.aiBubbleColor;
                const textColor = isUser ? settings.chat.userTextColor : settings.chat.aiTextColor;

                const includeImage = isUser ? settings.general.includeUserImages : settings.general.includeAIImages;

                let bubbleStyle: React.CSSProperties = {
                    padding: '12px 16px',
                    borderRadius: `${settings.chat.bubbleRadius}px`,
                    fontSize: `${settings.chat.fontSize}px`,
                    fontFamily: settings.general.fontFamily?.value || settings.chat.fontFamily,
                    marginBottom: `${settings.chat.spacing}px`,
                    maxWidth: '80%',
                    wordWrap: 'break-word',
                };

                if (settings.chat.bubbleStyle === 'filled') {
                    if (bubbleColor === 'transparent' && !isUser) {
                        bubbleStyle = { ...bubbleStyle, backgroundColor: '#f3f4f6', color: textColor };
                    } else {
                        bubbleStyle = { ...bubbleStyle, backgroundColor: bubbleColor, color: textColor };
                    }
                } else if (settings.chat.bubbleStyle === 'outlined') {
                    bubbleStyle = {
                        ...bubbleStyle,
                        border: `2px solid ${bubbleColor}`,
                        color: textColor,
                        backgroundColor: 'transparent',
                        fontWeight: '500',
                    };
                } else {
                    bubbleStyle = {
                        ...bubbleStyle,
                        color: textColor,
                        backgroundColor: 'transparent',
                        borderRadius: '0',
                        padding: '8px 0',
                    };
                }

                return (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            justifyContent: isUser ? 'flex-end' : 'flex-start',
                            marginBottom: `${settings.chat.spacing}px`,
                        }}
                    >
                        {settings.chat.showAvatars && !isUser && (
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                marginRight: '8px',
                                flexShrink: 0,
                            }}>
                                {
                                    source === 'chatgpt' ? (<img src="/chat/chatgpt.png" alt="" className='w-[50px]' />) : (
                                        source === 'claude' ? (<img src="/chat/claude.png" alt="" className='w-[50px]' />) : (
                                            source === 'deepseek' ? (<img src="/chat/deepseek.png" alt="" className='w-[50px]' />) : (
                                                <img src="/chat/gemini.png" alt="" className='w-[50px]' />
                                            )
                                        )
                                    )
                                }
                            </div>
                        )}
                        <div style={bubbleStyle} className={`${isUser ? "!rounded-tr-none" : "!rounded-tl-none"}`}>
                            {
                                message.content !== "" && (isUser ?
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{decodeHTMLEntities(message.content)}</div> :
                                    <div dangerouslySetInnerHTML={{ __html: message.content }} />)

                            }
                            <div className="w-full grid grid-cols-2 gap-2">
                                {
                                    includeImage && message.images && message.images.length > 0 && message.images.map((src, imgIndex) => (
                                        <div key={imgIndex} style={{ marginTop: '10px' }}>
                                            <img src={src} alt={`Generated image ${imgIndex + 1}`} style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '400px' }} />
                                        </div>
                                    ))
                                }
                            </div>
                            {
                                settings.general.includeUserAttachments && message.attachments && message.attachments.length > 0 &&
                                <div className="mt-2">
                                    <p className=" italic text-black/70 text-xs">*Note: we don't support viewing or downloading attachments</p>
                                    <div className="flex gap-2 flex-wrap mt-[-5px]">
                                        {
                                            message.attachments.map((attachment, attIndex) => (
                                                <div key={attIndex} className="flex flex-col bg-gray-100 px-4 py-2 rounded-md shadow w-fit max-w-[32%]">
                                                    <div className="flex items-center gap-2">
                                                        <HiDocumentText size={20} className="inline-block text-black/60" />
                                                        <span>{attachment.name}</span>
                                                    </div>
                                                    {
                                                        attachment.preview &&
                                                        <p className="text-[11px] leading-[12px] text-black/60 line-clamp-5">{attachment.preview + "..."}</p>
                                                    }
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            }
                        </div>
                        {settings.chat.showAvatars && isUser && (
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                marginLeft: '8px',
                                marginTop: "-5px",
                                flexShrink: 0,
                            }}>
                                <HiOutlineUserCircle className={`text-black w-[32px] h-[32px]`} />
                            </div>
                        )}

                    </div>
                );
            })}
        </>
    );
};