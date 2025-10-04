import { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { SiBuymeacoffee } from "react-icons/si";
import { FaGithub } from "react-icons/fa6";
import { TbMessageReport } from "react-icons/tb";
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { HiOutlineUserCircle } from "react-icons/hi2";
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/lib/useTheme';
import { Button } from '@/components/ui/button';
import { Input as ShadcnInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider as ShadcnSlider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        userBubbleColor: '#ffcc41',
        userTextColor: '#000000',
        aiBubbleColor: '#efefef',
        aiTextColor: '#3c3c3c',
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
    const [chatProps, setChatProps] = useState<{ title?: string }>({});
    const [settings, setSettings] = useState<PDFSettings>(defaultSettings);
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        layout: true,
        chatStyle: true,
        qaStyle: false,
        documentStyle: false,
        general: true,
    });
    const { effectiveTheme, loading } = useTheme(); // Add this

    useEffect(() => {
        // Load chat data
        chrome.storage.local.get(["chatData"], (result) => {
            setChatData(result.chatData);
        });

        chrome.storage.local.get(["chatProps"], (result) => {
            if (result.chatProps) {
                setChatProps(result.chatProps);
            }
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
                if (changes.chatProps) {
                    setChatProps(changes.chatProps.newValue);
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

    useEffect(() => {
        setSettings(prev => ({ ...prev, general: { ...prev.general, headerText: chatProps?.title || prev.general.headerText } }));
    }, [chatProps]);

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
        console.log("gerating pdf...");
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
                        paddingTop: '0',
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
                                    marginLeft: '8px',
                                    marginTop: "-5px",
                                    flexShrink: 0,
                                }}>
                                    <HiOutlineUserCircle className='text-foreground w-[32px] h-[32px]' />
                                </div>
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
        <div className='flex flex-col items-center h-dvh w-full !overflow-hidden'
        >
            {/* Header */}
            <div className='w-full flex items-center justify-between px-[50px] h-[65px] bg-primary'>
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
                    <ThemeToggle />
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
                <div className='w-[420px] h-full bg-gradient-to-b relative from-amber-50/70 to-amber-100/70 border-l border-amber-200 mt-1 flex flex-col'>
                    <div className='flex-1 overflow-y-auto p-6 py-4 space-y-4 pb-24' style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#fbb400 #fef3c7'
                    }}>

                        {/* Layout Selection */}
                        <h2 className='!text-base !my-0 !mb-1'>Select Layout</h2>
                        <div className='flex items-center gap-2'>
                            {(['chat', 'qa', 'document'] as const).map(layout => (
                                <div
                                    key={layout}
                                    onClick={() => updateSettings({ layout })}
                                    className={`w-full rounded-lg ${settings.layout === layout ? 'bg-primary/20 border-2 border-primary' : ' bg-white shadow-md'} hover:bg-primary/15`}
                                >
                                    {
                                        layout === 'chat' ? (
                                            <img src="/side/chat2.png" className={`flex-1 rounded-lg`} alt="Chat Layout" />
                                        ) : layout === 'qa' ? (
                                            <img src="/side/qna2.png" className={`flex-1 rounded-lg`} alt="Q&A Layout" />
                                        ) : (
                                            <img src="/side/doc2.png" className={`flex-1 rounded-lg`} alt="Document Layout" />
                                        )
                                    }
                                </div>
                            ))}
                        </div>


                        {/* Chat Style Settings */}
                        {settings.layout === 'chat' && (
                            <Card className="shadow-sm border border-gray-200">
                                <Collapsible open={expandedSections.chatStyle} onOpenChange={() => toggleSection('chatStyle')}>
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="px-4 py-3 bg-gradient-to-r from-amber-100 to-amber-50 hover:from-amber-150 hover:to-amber-100 transition-colors cursor-pointer">
                                            <CardTitle className="flex items-center justify-between font-semibold text-gray-800">
                                                Chat Style
                                                {expandedSections.chatStyle ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </CardTitle>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="p-4">
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
                                                <SliderComponent
                                                    label="Font Size"
                                                    value={settings.chat.fontSize}
                                                    min={10}
                                                    max={24}
                                                    onChange={(value) => updateSettings({ chat: { ...settings.chat, fontSize: value } })}
                                                />
                                                <SliderComponent
                                                    label="Border Radius"
                                                    value={settings.chat.bubbleRadius}
                                                    min={0}
                                                    max={30}
                                                    onChange={(value) => updateSettings({ chat: { ...settings.chat, bubbleRadius: value } })}
                                                />
                                                <SliderComponent
                                                    label="Message Spacing"
                                                    value={settings.chat.spacing}
                                                    min={4}
                                                    max={32}
                                                    onChange={(value) => updateSettings({ chat: { ...settings.chat, spacing: value } })}
                                                />
                                                <SelectComponent
                                                    label="Bubble Style"
                                                    value={settings.chat.bubbleStyle}
                                                    options={[
                                                        { value: 'filled', label: 'Filled' },
                                                        { value: 'outlined', label: 'Outlined' },
                                                        { value: 'minimal', label: 'Minimal' },
                                                    ]}
                                                    onChange={(value) => updateSettings({ chat: { ...settings.chat, bubbleStyle: value as any } })}
                                                />
                                                <ToggleComponent
                                                    label="Show Avatars"
                                                    checked={settings.chat.showAvatars}
                                                    onChange={(checked) => updateSettings({ chat: { ...settings.chat, showAvatars: checked } })}
                                                />
                                                <ToggleComponent
                                                    label="Show Timestamps"
                                                    checked={settings.chat.showTimestamps}
                                                    onChange={(checked) => updateSettings({ chat: { ...settings.chat, showTimestamps: checked } })}
                                                />
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Card>
                        )}

                        {/* Q&A Style Settings */}
                        {settings.layout === 'qa' && (
                            <Card className="shadow-sm border border-gray-200">
                                <Collapsible open={expandedSections.qaStyle} onOpenChange={() => toggleSection('qaStyle')}>
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="px-4 py-3 bg-gradient-to-r from-amber-100 to-amber-50 hover:from-amber-150 hover:to-amber-100 transition-colors cursor-pointer">
                                            <CardTitle className="flex items-center justify-between font-semibold text-gray-800">
                                                Q&A Style
                                                {expandedSections.qaStyle ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </CardTitle>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="p-4">
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
                                                <SliderComponent
                                                    label="Font Size"
                                                    value={settings.qa.fontSize}
                                                    min={10}
                                                    max={24}
                                                    onChange={(value) => updateSettings({ qa: { ...settings.qa, fontSize: value } })}
                                                />
                                                <InputComponent
                                                    label="Question Prefix"
                                                    value={settings.qa.questionPrefix}
                                                    onChange={(value) => updateSettings({ qa: { ...settings.qa, questionPrefix: value } })}
                                                />
                                                <InputComponent
                                                    label="Answer Prefix"
                                                    value={settings.qa.answerPrefix}
                                                    onChange={(value) => updateSettings({ qa: { ...settings.qa, answerPrefix: value } })}
                                                />
                                                <SelectComponent
                                                    label="Separator Style"
                                                    value={settings.qa.separatorStyle}
                                                    options={[
                                                        { value: 'line', label: 'Line' },
                                                        { value: 'dots', label: 'Dots' },
                                                        { value: 'none', label: 'None' },
                                                    ]}
                                                    onChange={(value) => updateSettings({ qa: { ...settings.qa, separatorStyle: value as any } })}
                                                />
                                                <ToggleComponent
                                                    label="Number Questions"
                                                    checked={settings.qa.numbering}
                                                    onChange={(checked) => updateSettings({ qa: { ...settings.qa, numbering: checked } })}
                                                />
                                                <ToggleComponent
                                                    label="Indent Answers"
                                                    checked={settings.qa.indentAnswer}
                                                    onChange={(checked) => updateSettings({ qa: { ...settings.qa, indentAnswer: checked } })}
                                                />
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Card>
                        )}

                        {/* Document Style Settings */}
                        {settings.layout === 'document' && (
                            <Card className="shadow-sm border border-gray-200">
                                <Collapsible open={expandedSections.documentStyle} onOpenChange={() => toggleSection('documentStyle')}>
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="px-4 py-3 bg-gradient-to-r from-amber-100 to-amber-50 hover:from-amber-150 hover:to-amber-100 transition-colors cursor-pointer">
                                            <CardTitle className="flex items-center justify-between font-semibold text-gray-800">
                                                Document Style
                                                {expandedSections.documentStyle ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </CardTitle>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="p-4">
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
                                                <SliderComponent
                                                    label="Font Size"
                                                    value={settings.document.fontSize}
                                                    min={10}
                                                    max={20}
                                                    onChange={(value) => updateSettings({ document: { ...settings.document, fontSize: value } })}
                                                />
                                                <SliderComponent
                                                    label="Line Height"
                                                    value={settings.document.lineHeight}
                                                    min={1.2}
                                                    max={2.5}
                                                    step={0.1}
                                                    onChange={(value) => updateSettings({ document: { ...settings.document, lineHeight: value } })}
                                                />
                                                <SliderComponent
                                                    label="Paragraph Spacing"
                                                    value={settings.document.paragraphSpacing}
                                                    min={8}
                                                    max={40}
                                                    onChange={(value) => updateSettings({ document: { ...settings.document, paragraphSpacing: value } })}
                                                />
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Card>
                        )}

                        {/* General Settings */}
                        <Card className="shadow-sm border border-gray-200">
                            <Collapsible open={expandedSections.general} onOpenChange={() => toggleSection('general')}>
                                <CollapsibleTrigger asChild>
                                    <CardHeader className="px-4 py-3 bg-gradient-to-r from-amber-100 to-amber-50 hover:from-amber-150 hover:to-amber-100 transition-colors cursor-pointer">
                                        <CardTitle className="flex items-center justify-between font-semibold text-gray-800">
                                            General Settings
                                            {expandedSections.general ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </CardTitle>
                                    </CardHeader>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <CardContent className="p-4">
                                        <div className='space-y-4'>
                                            <SelectComponent
                                                label="Page Size"
                                                value={settings.general.pageSize}
                                                options={[
                                                    { value: 'a4', label: 'A4' },
                                                    { value: 'letter', label: 'Letter' },
                                                    { value: 'legal', label: 'Legal' },
                                                ]}
                                                onChange={(value) => updateSettings({ general: { ...settings.general, pageSize: value as any } })}
                                            />
                                            <SliderComponent
                                                label="Margins"
                                                value={settings.general.margins}
                                                min={5}
                                                max={50}
                                                onChange={(value) => updateSettings({ general: { ...settings.general, margins: value } })}
                                            />
                                            <SelectComponent
                                                label="Theme"
                                                value={settings.general.theme}
                                                options={[
                                                    { value: 'light', label: 'Light' },
                                                    { value: 'dark', label: 'Dark' },
                                                    { value: 'sepia', label: 'Sepia' },
                                                ]}
                                                onChange={(value) => updateSettings({ general: { ...settings.general, theme: value as any } })}
                                            />
                                            <ToggleComponent
                                                label="Include Header"
                                                checked={settings.general.includeHeader}
                                                onChange={(checked) => updateSettings({ general: { ...settings.general, includeHeader: checked } })}
                                            />
                                            {settings.general.includeHeader && (
                                                <InputComponent
                                                    label="Header Text"
                                                    value={settings.general.headerText}
                                                    onChange={(value) => updateSettings({ general: { ...settings.general, headerText: value } })}
                                                />
                                            )}
                                            <ToggleComponent
                                                label="Include Footer"
                                                checked={settings.general.includeFooter}
                                                onChange={(checked) => updateSettings({ general: { ...settings.general, includeFooter: checked } })}
                                            />
                                            {settings.general.includeFooter && (
                                                <ToggleComponent
                                                    label="Show Page Numbers"
                                                    checked={settings.general.pageNumbers}
                                                    onChange={(checked) => updateSettings({ general: { ...settings.general, pageNumbers: checked } })}
                                                />
                                            )}
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    </div>

                    {/* Fixed Button Bar */}
                    <div className='flex items-center gap-4 w-full bg-amber-50/90 backdrop-blur-md py-4 px-6 border-t-[1px] border-amber-300 mt-auto'>
                        <Button
                            onClick={generatePDF}
                            className="flex-1 bg-primary hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md"
                            size="lg"
                        >
                            Export as PDF
                        </Button>

                        {/* Reset Button */}
                        <Button
                            onClick={resetSettings}
                            variant="outline"
                            className="flex-1"
                            size="default"
                        >
                            <RotateCcw size={16} />
                            Reset to Default
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// UI Components using shadcn/ui
function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
    return (
        <div>
            <Label className='block text-sm font-medium text-gray-700 mb-2'>{label}</Label>
            <div className='flex items-center gap-3'>
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className='h-10 w-16 rounded cursor-pointer border-2 border-gray-300'
                />
                <ShadcnInput
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className='flex-1'
                    placeholder="#000000"
                />
            </div>
        </div>
    );
}

function SliderComponent({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
    return (
        <div>
            <div className='flex items-center justify-between mb-2'>
                <Label className='text-sm font-medium text-gray-700'>{label}</Label>
                <span className='text-sm font-semibold text-amber-600'>{value}</span>
            </div>
            <ShadcnSlider
                value={[value]}
                onValueChange={(values) => onChange(values[0])}
                min={min}
                max={max}
                step={step}
                className="w-full"
            />
        </div>
    );
}

function ToggleComponent({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <div className='flex items-center justify-between'>
            <Label className='text-sm font-medium text-gray-700'>{label}</Label>
            <Switch
                checked={checked}
                onCheckedChange={onChange}
            />
        </div>
    );
}

function InputComponent({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
    return (
        <div>
            <Label className='block text-sm font-medium text-gray-700 mb-2'>{label}</Label>
            <ShadcnInput
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function SelectComponent({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
    return (
        <div>
            <Label className='block text-sm font-medium text-gray-700 mb-2'>{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    {options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export default App;