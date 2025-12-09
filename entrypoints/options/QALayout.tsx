import { HiDocumentText } from 'react-icons/hi2';
import { Message, PDFSettings } from './types';
import { decodeHTMLEntities } from './utils';

interface QALayoutProps {
    messages: Message[];
    settings: PDFSettings;
    editingIndex: number | null;
    onStartEdit: (index: number, element?: HTMLDivElement) => void;
    onContentChange: (index: number, content: string) => void;
    onFinishEdit: () => void;
}

export const QALayout = ({ messages, settings, editingIndex, onStartEdit, onContentChange, onFinishEdit }: QALayoutProps) => {
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
                                    (isQuestion ?
                                        <div
                                            style={{ whiteSpace: 'pre-wrap', outline: 'none', cursor: 'text' }}
                                            contentEditable={true}
                                            suppressContentEditableWarning
                                            ref={(el) => {
                                                if (el && !el.innerHTML && message.content) {
                                                    el.innerHTML = message.content || '';
                                                }
                                            }}
                                            onClick={(e) => {
                                                onStartEdit(index, e.currentTarget);
                                                e.currentTarget.focus();
                                            }}
                                            onInput={(e) => {
                                                onContentChange(index, e.currentTarget.innerHTML);
                                            }}
                                        >
                                        </div> :
                                        <div
                                            contentEditable={true}
                                            suppressContentEditableWarning
                                            style={{ outline: 'none', cursor: 'text' }}
                                            ref={(el) => {
                                                if (el && !el.innerHTML && message.content) {
                                                    el.innerHTML = message.content;
                                                }
                                            }}
                                            onClick={(e) => {
                                                onStartEdit(index, e.currentTarget);
                                                e.currentTarget.focus();
                                            }}
                                            onInput={(e) => {
                                                onContentChange(index, e.currentTarget.innerHTML);
                                            }}
                                        />)
                                }
                                <div className="w-full grid grid-cols-2 gap-2">
                                    {
                                        includeImage && message.images && message.images.map((imgSrc, imgIndex) => (
                                            <div key={imgIndex} style={{ marginTop: '12px' }}>
                                                <img src={imgSrc} alt={`Image ${imgIndex + 1}`} style={{ maxWidth: '100%', height: 'auto', maxHeight: '400px' }} />
                                            </div>
                                        ))
                                    }
                                </div>
                                {
                                    settings.general.includeUserAttachments && message.attachments && message.attachments.length > 0 &&
                                    <div style={{ marginTop: '8px' }}>
                                        <p style={{ margin: '0 0 8px 0', fontStyle: 'italic', color: '#4b5563', fontSize: '12px' }}>*Note: we don't support viewing or downloading documents</p>
                                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '-5px' }}>
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
                        </div>
                    </div>
                );
            })}
        </>
    );
};