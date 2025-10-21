import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/useTheme';
import { Message, PDFSettings, defaultSettings, ChatSource } from './types';
import { cleanHTML } from './utils';
import { Header } from './Header';
import { PreviewContainer } from './PreviewContainer';
import { SettingsPanel } from './SettingsPanel';
import { SaveChatDialog } from './SaveChatDialog';
import { SavePresetDialog } from './SavePresetDialog';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
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
    const [currentChatId, setCurrentChatId] = useState<number | null>(null);
    const [currentPresetId, setCurrentPresetId] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [chatSaved, setChatSaved] = useState(false);
    const [presetSaved, setPresetSaved] = useState(false);
    const [originalSettings, setOriginalSettings] = useState<PDFSettings | null>(null);
    const [originalChatData, setOriginalChatData] = useState<{ messages: Message[], selectedMessages: Set<number>, settings: PDFSettings } | null>(null);
    const [settingsChanged, setSettingsChanged] = useState(false);
    const [chatChanged, setChatChanged] = useState(false);
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
    const [pendingChatLoad, setPendingChatLoad] = useState<{ chat: SavedChat, preset: PDFSettings | null } | null>(null);


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
                const initialSelectedMessages: Set<number> = new Set(cleanedChatData.map((_: Message, index: number) => index));
                setSelectedMessages(initialSelectedMessages);

                // Set as original chat data for new chats from content script
                // This allows tracking changes even when currentChatId is null
                setOriginalChatData({
                    messages: JSON.parse(JSON.stringify(cleanedChatData)),
                    selectedMessages: new Set(initialSelectedMessages),
                    settings: JSON.parse(JSON.stringify(defaultSettings))
                });
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

    // Track settings changes
    useEffect(() => {
        if (originalSettings && currentPresetId !== null) {
            const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
            setSettingsChanged(changed);
        } else {
            setSettingsChanged(false);
        }
    }, [settings, originalSettings, currentPresetId]);

    // Track chat/message changes (including settings since they're part of saved chat)
    // Works for both saved chats (currentChatId !== null) and new chats (currentChatId === null)
    useEffect(() => {
        if (originalChatData && chatData) {
            const messagesChanged = JSON.stringify(chatData.messages) !== JSON.stringify(originalChatData.messages);
            const selectionChanged = JSON.stringify([...selectedMessages].sort()) !== JSON.stringify([...originalChatData.selectedMessages].sort());
            const settingsChanged = originalChatData.settings
                ? JSON.stringify(settings) !== JSON.stringify(originalChatData.settings)
                : false;
            setChatChanged(messagesChanged || selectionChanged || settingsChanged);
        } else {
            setChatChanged(false);
        }
    }, [chatData, selectedMessages, settings, originalChatData]);

    // Warn before closing tab with unsaved chat changes only (not preset changes)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (chatChanged) {
                e.preventDefault();
                // Modern browsers require returnValue to be set
                e.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [chatChanged]);

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
        setOriginalSettings(JSON.parse(JSON.stringify(presetSettings))); // Deep clone
        chrome.storage.local.set({ pdfSettings: presetSettings });
    };

    const handleSavePreset = async () => {
        if (currentPresetId !== null) {
            // Save directly without dialog for existing presets
            try {
                const { presetOperations } = await import('@/lib/settingsDB');
                const { db } = await import('@/lib/settingsDB');

                // Get current preset name
                const preset = await db.presets.get(currentPresetId);
                if (preset) {
                    await presetOperations.updatePreset(currentPresetId, preset.name, settings);

                    // Update original settings to match current
                    setOriginalSettings(JSON.parse(JSON.stringify(settings)));

                    // Show brief check animation
                    setPresetSaved(true);
                    setTimeout(() => setPresetSaved(false), 1500);
                }
            } catch (err) {
                console.error('Failed to save preset:', err);
            }
        }
        // If no currentPresetId, do nothing (button should be disabled)
    };

    const handleSaveAsPreset = () => {
        setShowSavePresetDialog(true);
    };

    const handlePresetCreated = (presetId: number) => {
        setCurrentPresetId(presetId);
        // Set original settings after creating new preset
        setOriginalSettings(JSON.parse(JSON.stringify(settings)));
    };

    const handleSaveChat = async () => {
        if (currentChatId !== null && chatData) {
            // Save directly without dialog for existing chats
            try {
                const { chatOperations } = await import('@/lib/settingsDB');

                // Get current chat name
                const { db } = await import('@/lib/settingsDB');
                const chat = await db.chats.get(currentChatId);

                if (chat && filteredMessages) {
                    await chatOperations.updateChat(
                        currentChatId,
                        chat.name,
                        chatData.title,
                        filteredMessages,
                        chatData.source,
                        settings
                    );

                    // Update original chat data
                    setOriginalChatData({
                        messages: JSON.parse(JSON.stringify(chatData.messages)),
                        selectedMessages: new Set(selectedMessages),
                        settings: JSON.parse(JSON.stringify(settings))
                    });

                    // Show brief check animation
                    setChatSaved(true);
                    setTimeout(() => setChatSaved(false), 1500);
                }
            } catch (err) {
                console.error('Failed to save chat:', err);
            }
        }
        // If no currentChatId, do nothing (will be handled by Save As button)
    };

    const handleSaveAsChat = () => {
        setShowSaveChatDialog(true);
    };

    const handleChatCreated = (chatId: number) => {
        setCurrentChatId(chatId);
        // Set original chat data after creating new chat
        if (chatData && filteredMessages) {
            setOriginalChatData({
                messages: JSON.parse(JSON.stringify(filteredMessages)),
                selectedMessages: new Set(selectedMessages),
                settings: JSON.parse(JSON.stringify(settings))
            });
        }
    };

    const handleLoadChat = (chat: SavedChat, preset: PDFSettings | null) => {
        // Check for unsaved changes
        if (chatChanged) {
            setPendingChatLoad({ chat, preset });
            setShowUnsavedChangesDialog(true);
            return;
        }

        // Proceed with loading
        loadChatData(chat, preset);
    };

    const loadChatData = (chat: SavedChat, preset: PDFSettings | null) => {
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
        const newSelectedMessages = new Set(chat.messages.map((_, index) => index));
        setSelectedMessages(newSelectedMessages);

        // Load preset settings if available (settings stored in chat)
        const chatSettings = preset || settings;
        if (preset) {
            setSettings(preset);
            chrome.storage.local.set({ pdfSettings: preset });
        }

        // Save original chat data
        setOriginalChatData({
            messages: JSON.parse(JSON.stringify(chat.messages)),
            selectedMessages: new Set(newSelectedMessages),
            settings: JSON.parse(JSON.stringify(chatSettings))
        });

        // Close sidebar after loading chat
        setSidebarOpen(false);
    };

    const handleUnsavedChangesSave = async () => {
        // Save the current chat
        if (currentChatId !== null && chatData) {
            try {
                const { chatOperations, db } = await import('@/lib/settingsDB');
                const chat = await db.chats.get(currentChatId);

                if (chat && filteredMessages) {
                    await chatOperations.updateChat(
                        currentChatId,
                        chat.name,
                        chatData.title,
                        filteredMessages,
                        chatData.source,
                        settings
                    );
                }
            } catch (err) {
                console.error('Failed to save chat:', err);
            }
        } else if (chatData && filteredMessages) {
            // Create new chat
            try {
                const { chatOperations } = await import('@/lib/settingsDB');
                const newChatId = await chatOperations.saveChat(
                    chatData.title,
                    chatData.title,
                    filteredMessages,
                    chatData.source,
                    settings
                );
                setCurrentChatId(newChatId);
            } catch (err) {
                console.error('Failed to create chat:', err);
            }
        }

        // Close dialog and load pending chat
        setShowUnsavedChangesDialog(false);
        if (pendingChatLoad) {
            loadChatData(pendingChatLoad.chat, pendingChatLoad.preset);
            setPendingChatLoad(null);
        }
    };

    const handleUnsavedChangesDiscard = () => {
        // Close dialog and load pending chat
        setShowUnsavedChangesDialog(false);
        if (pendingChatLoad) {
            loadChatData(pendingChatLoad.chat, pendingChatLoad.preset);
            setPendingChatLoad(null);
        }
    };

    const handleUnsavedChangesCancel = () => {
        // Just close dialog and clear pending
        setShowUnsavedChangesDialog(false);
        setPendingChatLoad(null);
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
                            chatSaved={chatSaved}
                            chatChanged={chatChanged}
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
                            settingsChanged={settingsChanged}
                            presetSaved={presetSaved}
                            onUpdateSettings={updateSettings}
                            onToggleSection={toggleSection}
                            onResetSettings={resetSettings}
                            onUpdateMessage={handleUpdateMessage}
                            onToggleMessage={handleToggleMessage}
                            onReorderMessages={handleReorderMessages}
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
                onChatCreated={handleChatCreated}
            />

            <SavePresetDialog
                open={showSavePresetDialog}
                onOpenChange={setShowSavePresetDialog}
                currentSettings={settings}
                currentPresetId={currentPresetId}
                onPresetCreated={handlePresetCreated}
            />

            <UnsavedChangesDialog
                open={showUnsavedChangesDialog}
                onSave={handleUnsavedChangesSave}
                onDiscard={handleUnsavedChangesDiscard}
                onCancel={handleUnsavedChangesCancel}
            />
        </div>
    );
}

export default App;