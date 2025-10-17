import { HiOutlineUserCircle } from "react-icons/hi2";
import { Message, PDFSettings } from './types';

interface ChatLayoutProps {
    messages: Message[];
    settings: PDFSettings;
}

export const ChatLayout = ({ messages, settings }: ChatLayoutProps) => {
    
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
                const bubbleColor = isUser ? settings.chat.userBubbleColor :  settings.chat.aiBubbleColor;
                const textColor = isUser ? settings.chat.userTextColor : settings.chat.aiTextColor;

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
                        bubbleStyle = { ...bubbleStyle, backgroundColor: '#f3f4f6', color: textColor};
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

                                <img src="/chat/chatgpt.png" alt="" className='w-[50px]' />
                            </div>
                        )}
                        <div style={bubbleStyle} className={`${isUser ? "!rounded-tr-none" : "!rounded-tl-none"}`}>
                            <div dangerouslySetInnerHTML={{ __html: message.content }} />
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