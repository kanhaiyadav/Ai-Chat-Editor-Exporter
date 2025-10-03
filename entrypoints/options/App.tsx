import { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { SiBuymeacoffee } from "react-icons/si";
import { FaGithub } from "react-icons/fa6";
import { TbMessageReport } from "react-icons/tb";
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

interface Message {
    role: string;
    content: string;
}

interface PDFSettings {
    layout: 'chat' | 'qa' | 'document';
    chat: {
        userBubbleColor: string;
        userTextColor: string;
        aiBubbleColor: string;
        aiTextColor: string;
        fontSize: number;
        fontFamily: string;
        bubbleRadius: number;
        spacing: number;
        showAvatars: boolean;
        showTimestamps: boolean;
        bubbleStyle: 'filled' | 'outlined' | 'minimal';
    };
    qa: {
        questionColor: string;
        answerColor: string;
        fontSize: number;
        fontFamily: string;
        showSeparator: boolean;
        separatorStyle: 'line' | 'dots' | 'none';
        numbering: boolean;
        questionPrefix: string;
        answerPrefix: string;
        indentAnswer: boolean;
    };
    document: {
        titleColor: string;
        bodyColor: string;
        fontSize: number;
        fontFamily: string;
        lineHeight: number;
        paragraphSpacing: number;
    };
    general: {
        pageSize: 'a4' | 'letter' | 'legal';
        margins: number;
        includeHeader: boolean;
        headerText: string;
        includeFooter: boolean;
        pageNumbers: boolean;
        theme: 'light' | 'dark' | 'sepia';
    };
}

const defaultSettings: PDFSettings = {
    layout: 'chat',
    chat: {
        userBubbleColor: '#3b82f6',
        userTextColor: '#ffffff',
        aiBubbleColor: '#22c55e',
        aiTextColor: '#ffffff',
        fontSize: 14,
        fontFamily: 'Inter, system-ui, sans-serif',
        bubbleRadius: 16,
        spacing: 12,
        showAvatars: true,
        showTimestamps: false,
        bubbleStyle: 'filled',
    },
    qa: {
        questionColor: '#1e293b',
        answerColor: '#475569',
        fontSize: 14,
        fontFamily: 'Georgia, serif',
        showSeparator: true,
        separatorStyle: 'line',
        numbering: true,
        questionPrefix: 'Q:',
        answerPrefix: 'A:',
        indentAnswer: true,
    },
    document: {
        titleColor: '#1e293b',
        bodyColor: '#334155',
        fontSize: 12,
        fontFamily: 'Georgia, serif',
        lineHeight: 1.6,
        paragraphSpacing: 16,
    },
    general: {
        pageSize: 'a4',
        margins: 20,
        includeHeader: true,
        headerText: 'AI Conversation Export',
        includeFooter: true,
        pageNumbers: true,
        theme: 'light',
    },
};

function App() {
    const [chatData, setChatData] = useState<Message[] | null>(null);
    const [settings, setSettings] = useState<PDFSettings>(defaultSettings);
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        layout: true,
        chatStyle: true,
        qaStyle: false,
        documentStyle: false,
        general: true,
    });

    useEffect(() => {
        // Load chat data
        chrome.storage.local.get(["chatData"], (result) => {
            setChatData(result.chatData);
        });

        // Load settings
        chrome.storage.local.get(["pdfSettings"], (result) => {
            if (result.pdfSettings) {
                setSettings(result.pdfSettings);
            }
        });

        interface StorageChange {
            newValue?: any;
        }

        interface StorageChanges {
            [key: string]: StorageChange;
        }

        const listener = (changes: StorageChanges, areaName: string) => {
            if (areaName === 'local') {
                if (changes.chatData) {
                    setChatData(changes.chatData.newValue);
                }
                if (changes.pdfSettings) {
                    setSettings(changes.pdfSettings.newValue);
                }
            }
        };

        chrome.storage.onChanged.addListener(listener);

        return () => {
            chrome.storage.onChanged.removeListener(listener);
        };
    }, []);

    const updateSettings = (updates: Partial<PDFSettings>) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);
        chrome.storage.local.set({ pdfSettings: newSettings });
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
        chrome.storage.local.set({ pdfSettings: defaultSettings });
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const generatePDF = () => {
        const container = document.getElementById('chat-container');
        if (container) {
            const options = {
                margin: settings.general.margins,
                filename: `chat-${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                },
                jsPDF: {
                    unit: 'mm' as const,
                    format: settings.general.pageSize,
                    orientation: 'portrait' as const
                }
            };
            html2pdf().set(options).from(container).save();
        }
    };

    const getThemeStyles = () => {
        const themes = {
            light: { bg: '#ffffff', text: '#000000' },
            dark: { bg: '#1a1a1a', text: '#ffffff' },
            sepia: { bg: '#f4ecd8', text: '#5c4a3a' },
        };
        return themes[settings.general.theme];
    };

    const renderChatLayout = () => {
        const themeStyles = getThemeStyles();
        return (
            <>
                {settings.general.includeHeader && (
                    <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        borderBottom: '2px solid #e5e7eb',
                        marginBottom: '20px',
                        fontFamily: settings.chat.fontFamily,
                        color: themeStyles.text,
                    }}>
                        <h1 style={{ margin: 0, fontSize: '24px' }}>{settings.general.headerText}</h1>
                    </div>
                )}
                {chatData && chatData.map((message, index) => {
                    const isUser = message.role === 'user';
                    const bubbleColor = isUser ? settings.chat.userBubbleColor : settings.chat.aiBubbleColor;
                    const textColor = isUser ? settings.chat.userTextColor : settings.chat.aiTextColor;

                    let bubbleStyle: React.CSSProperties = {
                        padding: '12px 16px',
                        borderRadius: `${settings.chat.bubbleRadius}px`,
                        fontSize: `${settings.chat.fontSize}px`,
                        fontFamily: settings.chat.fontFamily,
                        marginBottom: `${settings.chat.spacing}px`,
                        maxWidth: '70%',
                        wordWrap: 'break-word',
                    };

                    if (settings.chat.bubbleStyle === 'filled') {
                        bubbleStyle = { ...bubbleStyle, backgroundColor: bubbleColor, color: textColor };
                    } else if (settings.chat.bubbleStyle === 'outlined') {
                        bubbleStyle = {
                            ...bubbleStyle,
                            border: `2px solid ${bubbleColor}`,
                            color: bubbleColor,
                            backgroundColor: 'transparent',
                        };
                    } else {
                        bubbleStyle = {
                            ...bubbleStyle,
                            color: bubbleColor,
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
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: settings.chat.aiBubbleColor,
                                    marginRight: '8px',
                                    flexShrink: 0,
                                }}></div>
                            )}
                            <div style={bubbleStyle}>
                                <div dangerouslySetInnerHTML={{ __html: message.content }} />
                                {settings.chat.showTimestamps && (
                                    <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
                                        {new Date().toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                            {settings.chat.showAvatars && isUser && (
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: settings.chat.userBubbleColor,
                                    marginLeft: '8px',
                                    flexShrink: 0,
                                }}></div>
                            )}
                        </div>
                    );
                })}
            </>
        );
    };

    const renderQALayout = () => {
        const themeStyles = getThemeStyles();
        let questionNumber = 0;

        return (
            <>
                {settings.general.includeHeader && (
                    <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        borderBottom: '2px solid #e5e7eb',
                        marginBottom: '30px',
                        fontFamily: settings.qa.fontFamily,
                        color: themeStyles.text,
                    }}>
                        <h1 style={{ margin: 0, fontSize: '24px' }}>{settings.general.headerText}</h1>
                    </div>
                )}
                {chatData && chatData.map((message, index) => {
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
                            }}>
                                <div style={{
                                    fontWeight: 'bold',
                                    color: isQuestion ? settings.qa.questionColor : settings.qa.answerColor,
                                    fontSize: `${settings.qa.fontSize + 2}px`,
                                    fontFamily: settings.qa.fontFamily,
                                    marginBottom: '8px',
                                }}>
                                    {settings.qa.numbering && isQuestion ? `${questionNumber}. ` : ''}
                                    {isQuestion ? settings.qa.questionPrefix : settings.qa.answerPrefix}
                                </div>
                                <div style={{
                                    color: themeStyles.text,
                                    fontSize: `${settings.qa.fontSize}px`,
                                    fontFamily: settings.qa.fontFamily,
                                    lineHeight: '1.6',
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

    const renderDocumentLayout = () => {
        const themeStyles = getThemeStyles();

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
                {chatData && chatData.map((message, index) => (
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

    const themeStyles = getThemeStyles();

    return (
        <div className='flex flex-col items-center h-dvh w-screen overflow-hidden'>
            {/* Header */}
            <div className='w-full flex items-center justify-between px-[50px] h-[65px] bg-amber-400'>
                <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-xl'>
                        PDF
                    </div>
                    <div className='mt-[-5px]'>
                        <h1 className='text-2xl text-black/75 font-bold'>AI Chat Editor & Exporter</h1>
                        <p className='text-sm font-medium text-black/60 mt-[-3px]'>Convert AI chats to PDF</p>
                    </div>
                </div>
                <div className='flex items-center gap-6'>
                    <TbMessageReport className='text-black/80 cursor-pointer hover:text-black' size={26} />
                    <FaGithub className='text-black/80 cursor-pointer hover:text-black' size={24} />
                    <SiBuymeacoffee className='text-black/80 cursor-pointer hover:text-black' size={24} />
                </div>
            </div>

            {/* Main Content */}
            <div className='flex-1 min-h-0 flex items-center w-full inset-shadow-sm inset-shadow-black/30'>
                {/* Preview Area */}
                <div className='flex-1 h-full overflow-y-auto bg-gray-50 mt-1' style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e0 #f7fafc'
                }}>
                    <div
                        id='chat-container'
                        className='mx-auto my-8 p-8 bg-white shadow-lg'
                        style={{
                            maxWidth: '800px',
                            minHeight: '1000px',
                            backgroundColor: themeStyles.bg,
                        }}
                    >
                        {chatData && chatData.length > 0 ? (
                            settings.layout === 'chat' ? renderChatLayout() :
                                settings.layout === 'qa' ? renderQALayout() :
                                    renderDocumentLayout()
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                No chat data found. Start a conversation to see the preview.
                            </div>
                        )}
                        {settings.general.includeFooter && settings.general.pageNumbers && (
                            <div style={{
                                textAlign: 'center',
                                padding: '20px',
                                marginTop: '40px',
                                borderTop: '1px solid #e5e7eb',
                                fontSize: '12px',
                                color: themeStyles.text,
                                opacity: 0.6,
                            }}>
                                Page 1
                            </div>
                        )}
                    </div>
                </div>

                {/* Settings Panel */}
                <div className='w-[420px] h-full bg-gradient-to-b from-amber-50 to-amber-100 overflow-y-auto border-l border-amber-200 mt-1' style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#fbbf24 #fef3c7'
                }}>
                    <div className='p-6 space-y-4'>
                        {/* Export Button */}
                        <button
                            onClick={generatePDF}
                            className='w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md'
                        >
                            Export as PDF
                        </button>

                        {/* Reset Button */}
                        <button
                            onClick={resetSettings}
                            className='w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-300'
                        >
                            <RotateCcw size={16} />
                            Reset to Default
                        </button>

                        {/* Layout Selection */}
                        <Section title="Layout" expanded={expandedSections.layout} onToggle={() => toggleSection('layout')}>
                            <div className='space-y-2'>
                                {(['chat', 'qa', 'document'] as const).map(layout => (
                                    <button
                                        key={layout}
                                        onClick={() => updateSettings({ layout })}
                                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${settings.layout === layout
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {layout === 'chat' ? 'Chat Bubbles' : layout === 'qa' ? 'Q&A Format' : 'Document Style'}
                                    </button>
                                ))}
                            </div>
                        </Section>

                        {/* Chat Style Settings */}
                        {settings.layout === 'chat' && (
                            <Section title="Chat Style" expanded={expandedSections.chatStyle} onToggle={() => toggleSection('chatStyle')}>
                                <div className='space-y-4'>
                                    <ColorPicker
                                        label="User Bubble"
                                        value={settings.chat.userBubbleColor}
                                        onChange={(color) => updateSettings({ chat: { ...settings.chat, userBubbleColor: color } })}
                                    />
                                    <ColorPicker
                                        label="User Text"
                                        value={settings.chat.userTextColor}
                                        onChange={(color) => updateSettings({ chat: { ...settings.chat, userTextColor: color } })}
                                    />
                                    <ColorPicker
                                        label="AI Bubble"
                                        value={settings.chat.aiBubbleColor}
                                        onChange={(color) => updateSettings({ chat: { ...settings.chat, aiBubbleColor: color } })}
                                    />
                                    <ColorPicker
                                        label="AI Text"
                                        value={settings.chat.aiTextColor}
                                        onChange={(color) => updateSettings({ chat: { ...settings.chat, aiTextColor: color } })}
                                    />
                                    <Slider
                                        label="Font Size"
                                        value={settings.chat.fontSize}
                                        min={10}
                                        max={24}
                                        onChange={(value) => updateSettings({ chat: { ...settings.chat, fontSize: value } })}
                                    />
                                    <Slider
                                        label="Border Radius"
                                        value={settings.chat.bubbleRadius}
                                        min={0}
                                        max={30}
                                        onChange={(value) => updateSettings({ chat: { ...settings.chat, bubbleRadius: value } })}
                                    />
                                    <Slider
                                        label="Message Spacing"
                                        value={settings.chat.spacing}
                                        min={4}
                                        max={32}
                                        onChange={(value) => updateSettings({ chat: { ...settings.chat, spacing: value } })}
                                    />
                                    <Select
                                        label="Bubble Style"
                                        value={settings.chat.bubbleStyle}
                                        options={[
                                            { value: 'filled', label: 'Filled' },
                                            { value: 'outlined', label: 'Outlined' },
                                            { value: 'minimal', label: 'Minimal' },
                                        ]}
                                        onChange={(value) => updateSettings({ chat: { ...settings.chat, bubbleStyle: value as any } })}
                                    />
                                    <Toggle
                                        label="Show Avatars"
                                        checked={settings.chat.showAvatars}
                                        onChange={(checked) => updateSettings({ chat: { ...settings.chat, showAvatars: checked } })}
                                    />
                                    <Toggle
                                        label="Show Timestamps"
                                        checked={settings.chat.showTimestamps}
                                        onChange={(checked) => updateSettings({ chat: { ...settings.chat, showTimestamps: checked } })}
                                    />
                                </div>
                            </Section>
                        )}

                        {/* Q&A Style Settings */}
                        {settings.layout === 'qa' && (
                            <Section title="Q&A Style" expanded={expandedSections.qaStyle} onToggle={() => toggleSection('qaStyle')}>
                                <div className='space-y-4'>
                                    <ColorPicker
                                        label="Question Color"
                                        value={settings.qa.questionColor}
                                        onChange={(color) => updateSettings({ qa: { ...settings.qa, questionColor: color } })}
                                    />
                                    <ColorPicker
                                        label="Answer Color"
                                        value={settings.qa.answerColor}
                                        onChange={(color) => updateSettings({ qa: { ...settings.qa, answerColor: color } })}
                                    />
                                    <Slider
                                        label="Font Size"
                                        value={settings.qa.fontSize}
                                        min={10}
                                        max={24}
                                        onChange={(value) => updateSettings({ qa: { ...settings.qa, fontSize: value } })}
                                    />
                                    <Input
                                        label="Question Prefix"
                                        value={settings.qa.questionPrefix}
                                        onChange={(value) => updateSettings({ qa: { ...settings.qa, questionPrefix: value } })}
                                    />
                                    <Input
                                        label="Answer Prefix"
                                        value={settings.qa.answerPrefix}
                                        onChange={(value) => updateSettings({ qa: { ...settings.qa, answerPrefix: value } })}
                                    />
                                    <Select
                                        label="Separator Style"
                                        value={settings.qa.separatorStyle}
                                        options={[
                                            { value: 'line', label: 'Line' },
                                            { value: 'dots', label: 'Dots' },
                                            { value: 'none', label: 'None' },
                                        ]}
                                        onChange={(value) => updateSettings({ qa: { ...settings.qa, separatorStyle: value as any } })}
                                    />
                                    <Toggle
                                        label="Number Questions"
                                        checked={settings.qa.numbering}
                                        onChange={(checked) => updateSettings({ qa: { ...settings.qa, numbering: checked } })}
                                    />
                                    <Toggle
                                        label="Indent Answers"
                                        checked={settings.qa.indentAnswer}
                                        onChange={(checked) => updateSettings({ qa: { ...settings.qa, indentAnswer: checked } })}
                                    />
                                </div>
                            </Section>
                        )}

                        {/* Document Style Settings */}
                        {settings.layout === 'document' && (
                            <Section title="Document Style" expanded={expandedSections.documentStyle} onToggle={() => toggleSection('documentStyle')}>
                                <div className='space-y-4'>
                                    <ColorPicker
                                        label="Title Color"
                                        value={settings.document.titleColor}
                                        onChange={(color) => updateSettings({ document: { ...settings.document, titleColor: color } })}
                                    />
                                    <ColorPicker
                                        label="Body Color"
                                        value={settings.document.bodyColor}
                                        onChange={(color) => updateSettings({ document: { ...settings.document, bodyColor: color } })}
                                    />
                                    <Slider
                                        label="Font Size"
                                        value={settings.document.fontSize}
                                        min={10}
                                        max={20}
                                        onChange={(value) => updateSettings({ document: { ...settings.document, fontSize: value } })}
                                    />
                                    <Slider
                                        label="Line Height"
                                        value={settings.document.lineHeight}
                                        min={1.2}
                                        max={2.5}
                                        step={0.1}
                                        onChange={(value) => updateSettings({ document: { ...settings.document, lineHeight: value } })}
                                    />
                                    <Slider
                                        label="Paragraph Spacing"
                                        value={settings.document.paragraphSpacing}
                                        min={8}
                                        max={40}
                                        onChange={(value) => updateSettings({ document: { ...settings.document, paragraphSpacing: value } })}
                                    />
                                </div>
                            </Section>
                        )}

                        {/* General Settings */}
                        <Section title="General Settings" expanded={expandedSections.general} onToggle={() => toggleSection('general')}>
                            <div className='space-y-4'>
                                <Select
                                    label="Page Size"
                                    value={settings.general.pageSize}
                                    options={[
                                        { value: 'a4', label: 'A4' },
                                        { value: 'letter', label: 'Letter' },
                                        { value: 'legal', label: 'Legal' },
                                    ]}
                                    onChange={(value) => updateSettings({ general: { ...settings.general, pageSize: value as any } })}
                                />
                                <Slider
                                    label="Margins"
                                    value={settings.general.margins}
                                    min={5}
                                    max={50}
                                    onChange={(value) => updateSettings({ general: { ...settings.general, margins: value } })}
                                />
                                <Select
                                    label="Theme"
                                    value={settings.general.theme}
                                    options={[
                                        { value: 'light', label: 'Light' },
                                        { value: 'dark', label: 'Dark' },
                                        { value: 'sepia', label: 'Sepia' },
                                    ]}
                                    onChange={(value) => updateSettings({ general: { ...settings.general, theme: value as any } })}
                                />
                                <Toggle
                                    label="Include Header"
                                    checked={settings.general.includeHeader}
                                    onChange={(checked) => updateSettings({ general: { ...settings.general, includeHeader: checked } })}
                                />
                                {settings.general.includeHeader && (
                                    <Input
                                        label="Header Text"
                                        value={settings.general.headerText}
                                        onChange={(value) => updateSettings({ general: { ...settings.general, headerText: value } })}
                                    />
                                )}
                                <Toggle
                                    label="Include Footer"
                                    checked={settings.general.includeFooter}
                                    onChange={(checked) => updateSettings({ general: { ...settings.general, includeFooter: checked } })}
                                />
                                {settings.general.includeFooter && (
                                    <Toggle
                                        label="Show Page Numbers"
                                        checked={settings.general.pageNumbers}
                                        onChange={(checked) => updateSettings({ general: { ...settings.general, pageNumbers: checked } })}
                                    />
                                )}
                            </div>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
}

// UI Components
function Section({ title, expanded, onToggle, children }: { title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode }) {
    return (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
            <button
                onClick={onToggle}
                className='w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-amber-100 to-amber-50 hover:from-amber-150 hover:to-amber-100 transition-colors'
            >
                <span className='font-semibold text-gray-800'>{title}</span>
                {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expanded && (
                <div className='p-4'>
                    {children}
                </div>
            )}
        </div>
    );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
    return (
        <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
            <div className='flex items-center gap-3'>
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className='h-10 w-16 rounded cursor-pointer border-2 border-gray-300'
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm'
                    placeholder="#000000"
                />
            </div>
        </div>
    );
}

function Slider({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
    return (
        <div>
            <div className='flex items-center justify-between mb-2'>
                <label className='text-sm font-medium text-gray-700'>{label}</label>
                <span className='text-sm font-semibold text-amber-600'>{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500'
            />
        </div>
    );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <div className='flex items-center justify-between'>
            <label className='text-sm font-medium text-gray-700'>{label}</label>
            <button
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
    return (
        <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
            />
        </div>
    );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
    return (
        <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white'
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default App;