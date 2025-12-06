import { HiDocumentText } from 'react-icons/hi2';
import { Message, PDFSettings } from './types';
import { decodeHTMLEntities } from './utils';

interface DocumentLayoutProps {
    messages: Message[];
    settings: PDFSettings;
    editingIndex: number | null;
    onStartEdit: (index: number, element?: HTMLDivElement) => void;
    onContentChange: (index: number, content: string) => void;
    onFinishEdit: () => void;
}

export const DocumentLayout = ({ messages, settings, editingIndex, onStartEdit, onContentChange, onFinishEdit }: DocumentLayoutProps) => {
    return (
        <>
            {
                settings.general.includeHeader && (
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
                )}
            {messages.map((message, index) => {
                const isTopic = message.role === 'user';
                const includeImage = isTopic ? settings.general.includeUserImages : settings.general.includeAIImages;
                return (
                    <div key={index} style={{
                        marginBottom: `${settings.document.paragraphSpacing}px`,
                    }}>
                        {
                            message.content !== '' &&
                            <div style={{
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
                                {isTopic ?
                                    <div
                                        style={{ whiteSpace: 'pre-wrap', outline: 'none', cursor: 'text' }}
                                        contentEditable={true}
                                        suppressContentEditableWarning
                                        ref={(el) => {
                                            if (el && typeof message.content === 'string' && el.innerHTML !== message.content) {
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
                                        className={editingIndex === index ? 'ring-2 ring-primary rounded' : ''}
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
                                        className={editingIndex === index ? 'ring-2 ring-primary rounded' : ''}
                                    />}
                            </div>
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
                            <div className="mt-2">
                                <p className=" italic text-black/70 text-xs">*Note: we don't support viewing or downloading documents</p>
                                <div className="flex gap-3 flex-wrap mt-[-5px]">
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
                )
            })}
        </>
    );
};