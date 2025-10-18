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
                    color: settings.qa.questionColor,
                }}>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>{settings.general.headerText}</h1>
                </div>
            )}
            {messages.map((message, index) => {
                const isQuestion = message.role === 'user';
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
                                fontWeight: isQuestion? "600" : "400",
                            }}>
                                <div dangerouslySetInnerHTML={{ __html: message.content }} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
};