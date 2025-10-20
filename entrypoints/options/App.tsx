import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/useTheme';
import { Message, PDFSettings, defaultSettings, ChatSource } from './types';
import { cleanHTML } from './utils';
import { Header } from './Header';
import { PreviewContainer } from './PreviewContainer';
import { SettingsPanel } from './SettingsPanel';
import { SaveChatDialog } from './SaveChatDialog';
import { SavePresetDialog } from './SavePresetDialog';
import { SavedChat } from '@/lib/settingsDB';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';

interface StorageChange {
    newValue?: any;
}

interface StorageChanges {
    [key: string]: StorageChange;
}

interface ChatData {
    title: string;
    messages: Message[];
    source: ChatSource;
}

function App() {
    const [chatData, setChatData] = useState<ChatData | null>(null);
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
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
    const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
    const [saveChatMode, setSaveChatMode] = useState<'save' | 'saveAs'>('saveAs');
    const [savePresetMode, setSavePresetMode] = useState<'save' | 'saveAs'>('saveAs');
    const [currentChatId, setCurrentChatId] = useState<number | null>(null);
    const [currentPresetId, setCurrentPresetId] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [zoom, setZoom] = useState(1);


    useEffect(() => {
        // Load chat data
        chrome.storage.local.get(["chatData"], (result) => {
            const cleanedChatData = result.chatData?.messages?.map((msg: Message) => ({
                ...msg,
                content: cleanHTML(msg.content)
            }));
            const chatDataWithSource = {
                ...result.chatData,
                messages: cleanedChatData,
                source: result.chatData?.source || "chatgpt" as ChatSource, // Default to chatgpt for backward compatibility
            };
            setChatData(chatDataWithSource);
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

    const handleUpdateMessage = (index: number, content: string) => {
        if (!chatData) return;

        const updatedMessages = [...chatData.messages];
        updatedMessages[index] = { ...updatedMessages[index], content };
        const updatedChatData = { ...chatData, messages: updatedMessages };
        setChatData(updatedChatData);
        chrome.storage.local.set({ chatData: updatedChatData });
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
        const newChatData = { ...chatData!, messages: newOrder, source: chatData!.source };
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

    const handleLoadPreset = (presetSettings: PDFSettings, presetId: number) => {
        setSettings(presetSettings);
        setCurrentPresetId(presetId);
        chrome.storage.local.set({ pdfSettings: presetSettings });
    };

    const handleSavePreset = () => {
        if (currentPresetId !== null) {
            setSavePresetMode('save');
        } else {
            setSavePresetMode('saveAs');
        }
        setShowSavePresetDialog(true);
    };

    const handleSaveAsPreset = () => {
        setSavePresetMode('saveAs');
        setShowSavePresetDialog(true);
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
            source: chat.source,
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

        // Close sidebar after loading chat
        setSidebarOpen(false);
    };

    const handleToggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.1, 2));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.1, 0.5));
    };

    const handleResetZoom = () => {
        setZoom(1);
    };

    const handleGeneratePDF = () => {
        window.print();
    };

    // Filter messages based on selection
    const filteredMessages = chatData?.messages.filter((_, index) => selectedMessages.has(index)) || null;

    return (
        <div className='flex flex-col items-center h-screen w-full !overflow-hidden'>
            <Header />
            <SidebarProvider className='relative flex-1 min-h-0'>
                <AppSidebar
                    className='h-full'
                    onLoadChat={handleLoadChat}
                    onLoadPreset={handleLoadPreset}
                />
                <SidebarInset>
                    <div className='flex-1 min-h-0 flex items-center w-full inset-shadow-sm inset-shadow-black/30'>
                        <PreviewContainer
                            messages={filteredMessages}
                            settings={settings}
                            currentChatId={currentChatId}
                            zoom={zoom}
                            onSaveChat={handleSaveChat}
                            onSaveAsChat={handleSaveAsChat}
                            onExportPDF={handleGeneratePDF}
                            onZoomIn={handleZoomIn}
                            onZoomOut={handleZoomOut}
                            onResetZoom={handleResetZoom}
                        />

                        <SettingsPanel
                            settings={settings}
                            expandedSections={expandedSections}
                            messages={chatData?.messages || []}
                            selectedMessages={selectedMessages}
                            currentPresetId={currentPresetId}
                            onUpdateSettings={updateSettings}
                            onToggleSection={toggleSection}
                            onResetSettings={resetSettings}
                            onUpdateMessage={handleUpdateMessage}
                            onToggleMessage={handleToggleMessage}
                            onReorderMessages={handleReorderMessages}
                            onLoadPreset={handleLoadPreset}
                            onSavePreset={handleSavePreset}
                            onSaveAsPreset={handleSaveAsPreset}
                        />
                    </div>
                </SidebarInset>
            </SidebarProvider>

            <SaveChatDialog
                open={showSaveChatDialog}
                onOpenChange={setShowSaveChatDialog}
                chatTitle={chatData?.title || ''}
                messages={filteredMessages || []}
                chatSource={chatData?.source || 'chatgpt'}
                currentSettings={settings}
                currentChatId={currentChatId}
                mode={saveChatMode}
            />

            <SavePresetDialog
                open={showSavePresetDialog}
                onOpenChange={setShowSavePresetDialog}
                currentSettings={settings}
                currentPresetId={currentPresetId}
                mode={savePresetMode}
            />
        </div>
    );
}

export default App;