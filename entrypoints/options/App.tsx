import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/useTheme';
import { Message, PDFSettings, defaultSettings } from './types';
import { cleanHTML } from './utils';
import { Header } from './Header';
import { PreviewContainer } from './PreviewContainer';
import { SettingsPanel } from './SettingsPanel';

interface StorageChange {
    newValue?: any;
}

interface StorageChanges {
    [key: string]: StorageChange;
}

function App() {
    const [chatData, setChatData] = useState<Message[] | null>(null);
    const [chatProps, setChatProps] = useState<{ title?: string }>({});
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        layout: true,
        chatStyle: true,
        qaStyle: false,
        documentStyle: false,
        general: true,
        messages: true,
    });
    const { effectiveTheme, loading } = useTheme();
    const [settings, setSettings] = useState<PDFSettings>(defaultSettings);
    const [selectedMessages, setSelectedMessages] = useState<Set<number>>(new Set());


    useEffect(() => {
        // Load chat data
        chrome.storage.local.get(["chatData"], (result) => {
            const cleanedChatData = result.chatData?.map((msg: Message) => ({
                ...msg,
                content: cleanHTML(msg.content)
            }));
            result.chatData = cleanedChatData;
            setChatData(cleanedChatData);
            // Initialize all messages as selected
            if (cleanedChatData) {
                setSelectedMessages(new Set(cleanedChatData.map((_: Message, index: number) => index)));
            }
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

        const listener = (changes: StorageChanges, areaName: string) => {
            if (areaName === 'local') {
                if (changes.chatData) {
                    const cleanedData = changes.chatData.newValue?.map((msg: Message) => ({
                        ...msg,
                        content: cleanHTML(msg.content)
                    }));
                    setChatData(cleanedData);
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
        console.log('chatProps changed:', chatProps);
        setSettings(prev => ({
            ...prev,
            general: {
                ...prev.general,
                headerText: chatProps?.title || ''
            }
        }));
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

    const handleGeneratePDF = () => {
        // generatePDF(settings);
        window.print();
    };

    const handleUpdateMessage = (index: number, content: string) => {
        if (!chatData) return;

        const updatedMessages = [...chatData];
        updatedMessages[index] = { ...updatedMessages[index], content };
        setChatData(updatedMessages);
        chrome.storage.local.set({ chatData: updatedMessages });
    };

    const handleToggleMessage = (index: number) => {
        setSelectedMessages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const handleReorderMessages = (newOrder: Message[]) => {
        setChatData(newOrder);
        chrome.storage.local.set({ chatData: newOrder });

        // Update selected messages indices based on new order
        // We need to maintain the selection based on message identity, not index
        // For simplicity, we'll rebuild the selected set with updated indices
        const newSelectedMessages = new Set<number>();
        newOrder.forEach((message, newIndex) => {
            const oldIndex = chatData?.findIndex(
                (msg) => msg.role === message.role && msg.content === message.content
            );
            if (oldIndex !== undefined && oldIndex !== -1 && selectedMessages.has(oldIndex)) {
                newSelectedMessages.add(newIndex);
            }
        });
        setSelectedMessages(newSelectedMessages);
    };

    // Filter messages based on selection
    const filteredMessages = chatData?.filter((_, index) => selectedMessages.has(index)) || null;

    return (
        <div className='flex flex-col items-center h-dvh w-full !overflow-hidden'>
            <Header />

            <div className='flex-1 min-h-0 flex items-center w-full inset-shadow-sm inset-shadow-black/30'>
                <PreviewContainer
                    messages={filteredMessages}
                    settings={settings}
                />

                <SettingsPanel
                    settings={settings}
                    expandedSections={expandedSections}
                    messages={chatData}
                    selectedMessages={selectedMessages}
                    onUpdateSettings={updateSettings}
                    onToggleSection={toggleSection}
                    onResetSettings={resetSettings}
                    onGeneratePDF={handleGeneratePDF}
                    onUpdateMessage={handleUpdateMessage}
                    onToggleMessage={handleToggleMessage}
                    onReorderMessages={handleReorderMessages}
                />
            </div>
        </div>
    );
}

export default App;