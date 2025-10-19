import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/useTheme';
import { Message, PDFSettings, defaultSettings } from './types';
import { cleanHTML } from './utils';
import { Header } from './Header';
import { PreviewContainer } from './PreviewContainer';
import { SettingsPanel } from './SettingsPanel';
import { SaveChatDialog } from './SaveChatDialog';
import { SavedChat } from '@/lib/settingsDB';

interface StorageChange {
    newValue?: any;
}

interface StorageChanges {
    [key: string]: StorageChange;
}

interface ChatData {
    title: string;
    messages: Message[];
}

function App() {
    const [chatData, setChatData] = useState<ChatData | null>(null);
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        savedChats: false,
        presets: false,
        layout: false,
        chatStyle: false,
        qaStyle: false,
        documentStyle: false,
        general: false,
        messages: false,
    });
    const { effectiveTheme, loading } = useTheme();
    const [settings, setSettings] = useState<PDFSettings>(defaultSettings);
    const [selectedMessages, setSelectedMessages] = useState<Set<number>>(new Set());
    const [showSaveChatDialog, setShowSaveChatDialog] = useState(false);
    const [saveChatMode, setSaveChatMode] = useState<'save' | 'saveAs'>('saveAs');
    const [currentChatId, setCurrentChatId] = useState<number | null>(null);


    useEffect(() => {
        // Load chat data
        chrome.storage.local.get(["chatData"], (result) => {
            const cleanedChatData = result.chatData?.messages?.map((msg: Message) => ({
                ...msg,
                content: cleanHTML(msg.content)
            }));
            result.chatData = { ...result.chatData, messages: cleanedChatData };
            setChatData({ ...result.chatData, messages: cleanedChatData });
            // Initialize all messages as selected
            if (cleanedChatData) {
                setSelectedMessages(new Set(cleanedChatData.map((_: Message, index: number) => index)));
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
        setSettings(prev => ({
            ...prev,
            general: {
                ...prev.general,
                headerText: chatData?.title || ''
            }
        }));
    }, [chatData?.title]);

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

        const updatedMessages = [...chatData.messages];
        updatedMessages[index] = { ...updatedMessages[index], content };
        setChatData({ ...chatData, messages: updatedMessages });
        chrome.storage.local.set({ chatData: { ...chatData, messages: updatedMessages } });
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
        const newChatData = { ...chatData!, messages: newOrder };
        setChatData(newChatData);
        chrome.storage.local.set({ chatData: newChatData });

        // Update selected messages indices based on new order
        // We need to maintain the selection based on message identity, not index
        // For simplicity, we'll rebuild the selected set with updated indices
        const newSelectedMessages = new Set<number>();
        newOrder.forEach((message, newIndex) => {
            const oldIndex = chatData?.messages.findIndex(
                (msg) => msg.role === message.role && msg.content === message.content
            );
            if (oldIndex !== undefined && oldIndex !== -1 && selectedMessages.has(oldIndex)) {
                newSelectedMessages.add(newIndex);
            }
        });
        setSelectedMessages(newSelectedMessages);
    };

    const handleLoadPreset = (presetSettings: PDFSettings) => {
        setSettings(presetSettings);
        chrome.storage.local.set({ pdfSettings: presetSettings });
    };

    const handleSaveChat = () => {
        // If we have a current chat ID, show Save option, otherwise Save As
        if (currentChatId !== null) {
            setSaveChatMode('save');
        } else {
            setSaveChatMode('saveAs');
        }
        setShowSaveChatDialog(true);
    };

    const handleSaveAsChat = () => {
        setSaveChatMode('saveAs');
        setShowSaveChatDialog(true);
    };

    const handleLoadChat = (chat: SavedChat, preset: PDFSettings | null) => {
        // Load chat data
        const newChatData = {
            title: chat.title,
            messages: chat.messages,
        };
        setChatData(newChatData);
        chrome.storage.local.set({ chatData: newChatData });

        // Track the current chat ID
        setCurrentChatId(chat.id!);

        // Initialize all messages as selected
        setSelectedMessages(new Set(chat.messages.map((_, index) => index)));

        // Load preset settings if available
        if (preset) {
            setSettings(preset);
            chrome.storage.local.set({ pdfSettings: preset });
        }
    };

    // Filter messages based on selection
    const filteredMessages = chatData?.messages.filter((_, index) => selectedMessages.has(index)) || null;

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
                    messages={chatData?.messages || []}
                    selectedMessages={selectedMessages}
                    chatTitle={chatData?.title || ''}
                    currentChatId={currentChatId}
                    onUpdateSettings={updateSettings}
                    onToggleSection={toggleSection}
                    onResetSettings={resetSettings}
                    onGeneratePDF={handleGeneratePDF}
                    onUpdateMessage={handleUpdateMessage}
                    onToggleMessage={handleToggleMessage}
                    onReorderMessages={handleReorderMessages}
                    onLoadPreset={handleLoadPreset}
                    onSaveChat={handleSaveChat}
                    onSaveAsChat={handleSaveAsChat}
                    onLoadChat={handleLoadChat}
                />
            </div>

            <SaveChatDialog
                open={showSaveChatDialog}
                onOpenChange={setShowSaveChatDialog}
                chatTitle={chatData?.title || ''}
                messages={filteredMessages || []}
                currentSettings={settings}
                currentChatId={currentChatId}
                mode={saveChatMode}
            />
        </div>
    );
}

export default App;