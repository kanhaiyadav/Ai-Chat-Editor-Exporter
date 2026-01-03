import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useTheme } from '@/lib/useTheme';
import { Message, PDFSettings, defaultSettings, ChatSource } from './types';
import { cleanHTML, exportToWord, exportToMarkdown, exportToHTML, exportToPlainText } from './utils';
import { Header } from './Header';
import { PreviewContainer } from './PreviewContainer';
import { SettingsPanel } from './SettingsPanel';
import { SaveChatDialog } from './SaveChatDialog';
import { SavePresetDialog } from './SavePresetDialog';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { MergeChatsDialog } from './MergeChatsDialog';

import { BulkExportChatsDialog } from './BulkExportChatsDialog';
import { ImportChatDialog } from './ImportChatDialog';
import { SavedChat, SavedPreset } from '@/lib/settingsDB';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { ConfirmationDialog } from './ConfirmationDialog';
import { useTranslation } from 'react-i18next';
import { MessageManagementPanel, MessageManagementPanelRef } from './MessageManagementPanel';
import { EditorPanel, EditorPanelRef } from './EditorPanel';
import { Save, Cog, Palette } from 'lucide-react';
import { FiFileText } from 'react-icons/fi';

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
    artifacts: Array<any>;
    htmlCleaned?: boolean; // Flag to track if HTML has been cleaned
}

const deepEqual = (a: unknown, b: unknown): boolean => {
    if (Object.is(a, b)) {
        return true;
    }

    if (typeof a !== typeof b || a === null || b === null) {
        return false;
    }

    if (Array.isArray(a) || Array.isArray(b)) {
        if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }

    if (a instanceof Date || b instanceof Date) {
        if (!(a instanceof Date) || !(b instanceof Date)) {
            return false;
        }
        return a.getTime() === b.getTime();
    }

    if (typeof a === 'object' && typeof b === 'object') {
        const objA = a as Record<string, unknown>;
        const objB = b as Record<string, unknown>;
        const keysA = Object.keys(objA);
        const keysB = Object.keys(objB);

        if (keysA.length !== keysB.length) {
            return false;
        }

        for (const key of keysA) {
            if (!Object.prototype.hasOwnProperty.call(objB, key)) {
                return false;
            }
            if (!deepEqual(objA[key], objB[key])) {
                return false;
            }
        }

        return true;
    }

    return false;
};
function App() {
    const { t } = useTranslation();
    const [chatData, setChatData] = useState<ChatData | null>(null);
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        presets: false,
        layout: false,
        chatStyle: true,
        qaStyle: true,
        documentStyle: true,
        general: true,
    });
    const { effectiveTheme, loading } = useTheme();
    const [settings, setSettings] = useState<PDFSettings>(defaultSettings);
    const [selectedMessages, setSelectedMessages] = useState<Set<number>>(new Set());
    const [showSaveChatDialog, setShowSaveChatDialog] = useState(false);
    const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<number | null>(null);
    const [currentPresetId, setCurrentPresetId] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [chatSaved, setChatSaved] = useState(false);
    const [presetSaved, setPresetSaved] = useState(false);
    const [originalSettings, setOriginalSettings] = useState<PDFSettings | null>(null);
    const [originalChatData, setOriginalChatData] = useState<{ messages: Message[], selectedMessages: Set<number>, settings: PDFSettings } | null>(null);
    const [settingsChanged, setSettingsChanged] = useState(false);
    const [chatChanged, setChatChanged] = useState(false);
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
    const [pendingChatLoad, setPendingChatLoad] = useState<{ chat: SavedChat, preset: PDFSettings | null } | null>(null);
    const [pendingCloseChat, setPendingCloseChat] = useState(false);
    const [showMergeDialog, setShowMergeDialog] = useState(false);
    const [pendingPreset, setPendingPreset] = useState<SavedPreset | null>(null);
    const [showPresetWarning, setShowPresetWarning] = useState(false);
    const [showResetWarning, setShowResetWarning] = useState(false);

    const [showBulkExportDialog, setShowBulkExportDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
    const [editingElementRef, setEditingElementRef] = useState<HTMLDivElement | null>(null);
    const [showMessageManagementPanel, setShowMessageManagementPanel] = useState(false);
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [showEditorPanel, setShowEditorPanel] = useState(false);

    // Refs for panel components to call requestClose
    const messageManagementPanelRef = useRef<MessageManagementPanelRef>(null);
    const editorPanelRef = useRef<EditorPanelRef>(null);

    // Pending state for opening panels after another closes
    const [pendingOpenMessagePanel, setPendingOpenMessagePanel] = useState(false);
    const [pendingOpenEditorPanel, setPendingOpenEditorPanel] = useState(false);


    useEffect(() => {
        const init = async () => {
            // Helper to use chrome.storage with await
            const getFromStorage = (keys: string[]): Promise<any> => {
                return new Promise((resolve) => {
                    chrome.storage.local.get(keys, (result) => {
                        resolve(result);
                    });
                });
            };

            // 1️⃣ Load savedChatId first
            const { savedChatId } = await getFromStorage(["savedChatId"]);

            if (savedChatId) {
                setCurrentChatId(savedChatId);

                // 2️⃣ Load chat data
                const { chatData } = await getFromStorage(["chatData"]);
                const SavedChatData: ChatData = {
                    ...chatData,
                    source: chatData?.source || ("chatgpt" as ChatSource),
                    htmlCleaned: true, // Saved chats are already cleaned
                };
                setChatData(SavedChatData);

                // 3️⃣ Initialize selected messages
                const initialSelectedMessages = new Set(
                    SavedChatData?.messages.map((_: Message, index: number) => index)
                );
                setSelectedMessages(initialSelectedMessages);

                // 4️⃣ Load PDF settings
                const { pdfSettings } = await getFromStorage(["pdfSettings"]);
                if (pdfSettings) setSettings(pdfSettings);

                // 5️⃣ Set original chat data
                setOriginalChatData({
                    messages: SavedChatData?.messages || [],
                    selectedMessages: new Set(initialSelectedMessages),
                    settings: pdfSettings || defaultSettings,
                });
            } else {

                const { chatData } = await getFromStorage(["chatData"]);

                // Only clean HTML if it hasn't been cleaned before
                const needsCleaning = chatData && !chatData.htmlCleaned;
                const cleanedChatData = needsCleaning
                    ? chatData?.messages?.map((msg: Message) => ({
                        ...msg,
                        content: cleanHTML(msg.content, chatData?.source),
                    }))
                    : chatData?.messages;

                const chatDataWithSource = {
                    ...chatData,
                    messages: cleanedChatData,
                    source: chatData?.source || ("chatgpt" as ChatSource),
                    htmlCleaned: true, // Mark as cleaned
                };
                setChatData(chatDataWithSource);

                // Save the cleaned data back to storage so it persists
                if (needsCleaning && chatData) {
                    chrome.storage.local.set({ chatData: chatDataWithSource });
                }

                if (cleanedChatData) {
                    const initialSelectedMessages: Set<number> = new Set(
                        cleanedChatData.map((_: Message, index: number) => index)
                    );
                    setSelectedMessages(initialSelectedMessages);
                    setOriginalChatData({
                        messages: JSON.parse(JSON.stringify(cleanedChatData)),
                        selectedMessages: new Set(initialSelectedMessages),
                        settings: JSON.parse(JSON.stringify(defaultSettings)),
                    });
                }

                const { pdfSettings } = await getFromStorage(["pdfSettings"]);
                if (pdfSettings) setSettings(pdfSettings);
            }

            // 🧏‍♀️ Add change listener
            const listener = (changes: StorageChanges, areaName: string) => {
                if (areaName === "local") {
                    if (changes.chatData && changes.chatData.newValue) {
                        const newChatData = changes.chatData.newValue;

                        // Only clean HTML if it hasn't been cleaned before
                        if (newChatData.htmlCleaned) {
                            // Already cleaned, use as-is
                            setChatData(newChatData);
                        } else {
                            // Clean HTML for fresh data from external sources
                            const cleanedMessages = newChatData.messages?.map(
                                (msg: Message) => ({
                                    ...msg,
                                    content: cleanHTML(msg.content, newChatData.source || "chatgpt"),
                                })
                            );
                            const cleanedChatData = {
                                ...newChatData,
                                messages: cleanedMessages,
                                htmlCleaned: true,
                            };
                            setChatData(cleanedChatData);
                            // Save the cleaned data back to storage
                            chrome.storage.local.set({ chatData: cleanedChatData });
                        }
                    }
                    if (changes.pdfSettings) {
                        setSettings(changes.pdfSettings.newValue);
                    }
                    if (changes.savedChatId) {
                        setCurrentChatId(changes.savedChatId.newValue);
                    }
                }
            };

            chrome.storage.onChanged.addListener(listener);
            return () => chrome.storage.onChanged.removeListener(listener);
        };

        init();
    }, []);


    useEffect(() => {
        setSettings(prev => ({
            ...prev,
            general: {
                ...prev?.general,
                headerText: chatData?.title || ''
            }
        }));
    }, [chatData?.title]);

    // Track settings changes
    useEffect(() => {
        if (originalSettings && currentPresetId !== null) {
            const changed = !deepEqual(settings, originalSettings);
            setSettingsChanged(changed);
        } else {
            setSettingsChanged(false);
        }
    }, [settings, originalSettings, currentPresetId]);

    // Track chat/message changes (including settings since they're part of saved chat)
    // Works for both saved chats (currentChatId !== null) and new chats (currentChatId === null)
    useEffect(() => {
        if (originalChatData && chatData) {
            const messagesChanged = !deepEqual(chatData.messages, originalChatData.messages);
            const selectionChanged = !deepEqual(
                Array.from(selectedMessages).sort((a, b) => a - b),
                Array.from(originalChatData.selectedMessages).sort((a, b) => a - b)
            );
            console.log('🤔🤔🤔', { originalSettings: originalChatData.settings, settings });
            const settingsChanged = originalChatData.settings
                ? !deepEqual(settings, originalChatData.settings)
                : false;
            console.log('😂😂😂', { messagesChanged, selectionChanged, settingsChanged });
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

    // Handle pending panel opens when another panel closes
    // Open MessageManagementPanel after EditorPanel closes
    useEffect(() => {
        if (!showEditorPanel && pendingOpenMessagePanel) {
            setPendingOpenMessagePanel(false);
            setShowMessageManagementPanel(true);
        }
    }, [showEditorPanel, pendingOpenMessagePanel]);

    // Open EditorPanel after MessageManagementPanel closes
    useEffect(() => {
        if (!showMessageManagementPanel && pendingOpenEditorPanel) {
            setPendingOpenEditorPanel(false);
            setShowEditorPanel(true);
            setIsEditingContent(true);
        }
    }, [showMessageManagementPanel, pendingOpenEditorPanel]);

    const updateSettings = (updates: Partial<PDFSettings>) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);
        chrome.storage.local.set({ pdfSettings: newSettings });
    };

    const handleResetSettingsRequest = () => {
        setShowResetWarning(true);
    };

    const resetSettings = () => {
        const preservedHeaderText = settings.general.headerText;
        const defaultClone: PDFSettings = JSON.parse(JSON.stringify(defaultSettings));
        defaultClone.general.headerText = preservedHeaderText;
        setSettings(defaultClone);
        chrome.storage.local.set({ pdfSettings: defaultClone });
        setShowResetWarning(false);
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

    const handleStartEditMessage = (index: number, element?: HTMLDivElement) => {
        setEditingMessageIndex(index);
        if (element) {
            setEditingElementRef(element);
        }
        // Open editor panel when starting to edit
        setShowEditorPanel(true);
    };

    // This is now only called when user explicitly saves from the editor panel
    const handleSaveEditedContent = (index: number, content: string) => {
        handleUpdateMessage(index, content);
    };

    // No-op for live content changes - we don't save immediately anymore
    const handleContentChange = (index: number, content: string) => {
        // Content changes are tracked locally in contentEditable, not saved to state
        // This prevents the re-render that causes focus loss
    };

    const handleFinishEdit = () => {
        setEditingMessageIndex(null);
        setEditingElementRef(null);
        setShowEditorPanel(false);
        setIsEditingContent(false); // Deactivate editing button
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
        if (!chatData) return;

        // We need to map old selection indices to new indices
        // The newOrder already contains the reordered messages
        // We need to find where each originally-selected message ended up

        // Create a reference map using original message references
        const originalMessages = chatData.messages;
        const newSelectedMessages = new Set<number>();

        // For each message in the new order, check if it was selected in the old order
        // We do this by finding its original index through reference comparison
        newOrder.forEach((newMsg, newIndex) => {
            const originalIndex = originalMessages.findIndex(
                (oldMsg) => oldMsg === newMsg
            );
            if (originalIndex !== -1 && selectedMessages.has(originalIndex)) {
                newSelectedMessages.add(newIndex);
            }
        });

        // Update both states synchronously using flushSync to prevent render inconsistencies
        const newChatData = { ...chatData, messages: newOrder, source: chatData.source };

        flushSync(() => {
            setChatData(newChatData);
            setSelectedMessages(newSelectedMessages);
        });

        // Save to chrome storage after state updates
        chrome.storage.local.set({ chatData: newChatData });
    };

    const handleSaveMessageChanges = (messages: Message[], selectedIndices: Set<number>) => {
        if (!chatData) return;

        const newChatData = { ...chatData, messages, source: chatData.source };

        flushSync(() => {
            setChatData(newChatData);
            setSelectedMessages(selectedIndices);
        });

        // Save to chrome storage after state updates
        chrome.storage.local.set({ chatData: newChatData });
    };

    const handleLoadPreset = (preset: SavedPreset) => {
        setPendingPreset(preset);
        setShowPresetWarning(true);
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

    const applyPendingPreset = () => {
        if (!pendingPreset || !pendingPreset.id) {
            setPendingPreset(null);
            setShowPresetWarning(false);
            return;
        }

        const presetSettings: PDFSettings = JSON.parse(JSON.stringify(pendingPreset.settings));
        presetSettings.general.headerText = settings.general.headerText;
        setSettings(presetSettings);
        setCurrentPresetId(pendingPreset.id);
        setOriginalSettings(JSON.parse(JSON.stringify(presetSettings)));
        chrome.storage.local.set({ pdfSettings: presetSettings });
        setPendingPreset(null);
        setShowPresetWarning(false);
    };

    const cancelPendingPreset = () => {
        setPendingPreset(null);
        setShowPresetWarning(false);
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

    const handleCloseChat = () => {
        if (chatChanged) {
            setPendingCloseChat(true);
            setShowUnsavedChangesDialog(true);
            return;
        }

        // Clear messages array in chatData
        if (chatData) {
            const clearedChatData = {
                ...chatData,
                messages: [],
                title: "",
                source: ""
            };
            setChatData(null);
            setOriginalChatData(null);

            // Update storage with empty messages and clear pdf settings
            chrome.storage.local.set({ chatData: clearedChatData, pdfSettings: null, savedChatId: null });
        }
    };

    const handleChatCreated = (chatId: number) => {
        setCurrentChatId(chatId);
        chrome.storage.local.set({ savedChatId: chatId, pdfSettings: settings });
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
        // Load chat data - mark as htmlCleaned since saved chats are already cleaned
        const newChatData = {
            title: chat.title,
            messages: chat.messages,
            source: chat.source,
            artifacts: [],
            htmlCleaned: true, // Saved chats are already cleaned, don't clean again
        };
        setChatData(newChatData);
        chrome.storage.local.set({ chatData: newChatData, savedChatId: chat.id! });

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

        // Close dialog
        setShowUnsavedChangesDialog(false);

        // Handle pending action after save
        if (pendingCloseChat) {
            // Proceed with closing chat
            if (chatData) {
                const clearedChatData = {
                    ...chatData,
                    messages: []
                };
                setChatData(null);
                setOriginalChatData(null);
                chrome.storage.local.set({ chatData: clearedChatData, pdfSettings: null, savedChatId: null });
            }
            setPendingCloseChat(false);
        } else if (pendingChatLoad) {
            loadChatData(pendingChatLoad.chat, pendingChatLoad.preset);
            setPendingChatLoad(null);
        }
    };

    const handleUnsavedChangesDiscard = () => {
        // Close dialog
        setShowUnsavedChangesDialog(false);

        // Handle pending action
        if (pendingCloseChat) {
            // Proceed with closing chat without saving
            if (chatData) {
                const clearedChatData = {
                    ...chatData,
                    messages: []
                };
                setChatData(null);
                setOriginalChatData(null);
                chrome.storage.local.set({ chatData: clearedChatData, pdfSettings: null, savedChatId: null });
            }
            setPendingCloseChat(false);
        } else if (pendingChatLoad) {
            loadChatData(pendingChatLoad.chat, pendingChatLoad.preset);
            setPendingChatLoad(null);
        }
    };

    const handleUnsavedChangesCancel = () => {
        // Just close dialog and clear pending
        setShowUnsavedChangesDialog(false);
        setPendingChatLoad(null);
        setPendingCloseChat(false);
    };

    const handleToggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleGeneratePDF = () => {
        window.print();
    };

    const handleOpenInWord = () => {
        exportToWord();
    };

    const handleExportMarkdown = () => {
        exportToMarkdown();
    };

    const handleExportHTML = () => {
        exportToHTML();
    };

    const handleExportPlainText = () => {
        exportToPlainText();
    };

    const handleExportJSON = async () => {
        if (!chatData) return;

        let chatName: string;
        let chatTitle: string;
        let messages: Message[];
        let source: string;

        // If it's a saved chat, export the full saved chat data
        if (currentChatId) {
            const { chatOperations } = await import('@/lib/settingsDB');
            const chat = await chatOperations.getChat(currentChatId);
            if (chat) {
                chatName = chat.name;
                chatTitle = chat.title;
                messages = chat.messages;
                source = chat.source;
            } else {
                return;
            }
        } else {
            // For unsaved chats, use current chat data
            chatName = chatData.title || 'Untitled Chat';
            chatTitle = chatData.title || 'Untitled Chat';
            messages = chatData.messages;
            source = chatData.source;
        }

        // Export directly as JSON
        const exportData = {
            version: 1,
            exportDate: new Date().toISOString(),
            source,
            chatName,
            chatTitle,
            messageCount: messages.length,
            messages,
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${chatName || 'chat'}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleMergeChats = (mergedMessages: Message[]) => {
        if (!chatData) return;

        // Update chat data with merged messages
        const updatedChatData = {
            ...chatData,
            title: chatData.title + ' (Merged)',
            messages: mergedMessages
        };
        setChatData(updatedChatData);
        chrome.storage.local.set({ chatData: updatedChatData });

        // Select all merged messages
        const newSelectedMessages = new Set(mergedMessages.map((_, index) => index));
        setSelectedMessages(newSelectedMessages);

        // Reset current chat ID as this is a new merged chat
        setCurrentChatId(null);

        // Update original chat data to track future changes
        setOriginalChatData({
            messages: JSON.parse(JSON.stringify(mergedMessages)),
            selectedMessages: new Set(newSelectedMessages),
            settings: JSON.parse(JSON.stringify(settings))
        });
    };

    // Filter messages based on selection
    const filteredMessages = chatData?.messages?.filter((_, index) => selectedMessages.has(index)) || null;

    // Show a welcome screen when URL contains ?welcome=true
    // Only show welcome if there's no loaded chat (so clicking a saved chat opens preview)
    const showWelcome = typeof window !== 'undefined'
        && new URLSearchParams(window.location.search).get('welcome') === 'true'
        && currentChatId === null
        && (!(chatData && chatData.messages && chatData.messages.length > 0));

    return (
        <div className='flex flex-col items-center h-screen w-full !overflow-hidden'>
            <Header />
            <SidebarProvider className='relative flex-1 min-h-0'>
                <AppSidebar
                    className='h-full'
                    onLoadChat={handleLoadChat}
                    onLoadPreset={handleLoadPreset}
                    onOpenBulkExport={() => setShowBulkExportDialog(true)}
                    onOpenImport={() => setShowImportDialog(true)}
                    closeChat={handleCloseChat}
                />
                <SidebarInset>
                    <div className='flex-1 min-h-0 flex items-center w-full inset-shadow-sm inset-shadow-black/30'>
                        {showWelcome ? (
                            <div className="flex-1 h-full overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
                                <div className="max-w-4xl w-full mx-auto p-8 space-y-8 animate-in fade-in duration-500">
                                    {/* Welcome Header */}
                                    <div className="text-center space-y-4">
                                        <div className="flex items-center justify-center gap-4 mb-6">
                                            <img src="/icon/128.png" alt="ExportMyChat" className="w-16 h-16" />
                                            <div className="text-left">
                                                <h1 className="text-4xl font-bold text-primary">
                                                    ExportMyChat
                                                </h1>
                                                <p className="text-lg text-muted-foreground font-medium">
                                                    Edit and Export AI Chats
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground max-w-2xl mx-auto">
                                            Transform your AI conversations into beautifully formatted documents with full editing control
                                        </p>
                                    </div>

                                    {/* Features Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
                                        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                                            <Save className="w-5 h-5 text-primary mt-0.5" />
                                            <div>
                                                <h3 className="font-semibold mb-1">Save & Manage</h3>
                                                <p className="text-sm text-muted-foreground">Merge, save and organize your AI conversations</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border border-border hover:border-primary/50 transition-colors">
                                            <FiFileText className="w-5 h-5 text-primary mt-0.5" />
                                            <div>
                                                <h3 className="font-semibold mb-1">Multiple Formats</h3>
                                                <p className="text-sm text-muted-foreground">Export to PDF, Doc, HTML, Markdown, and more</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border border-border hover:border-primary/50 transition-colors">
                                            <Cog className="w-5 h-5 text-primary mt-0.5" />
                                            <div>
                                                <h3 className="font-semibold mb-1">Full Customization</h3>
                                                <p className="text-sm text-muted-foreground">Fine-tune styling, layout, and export settings</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                                            <Palette className="w-5 h-5 text-primary mt-0.5" />
                                            <div>
                                                <h3 className="font-semibold mb-1">Presets</h3>
                                                <p className="text-sm text-muted-foreground">Create and save presets for quick exports</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* How to Use Section */}
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-center">How to Get Started</h2>

                                        {/* Platform Instructions */}
                                        <div className="space-y-6">
                                            {[
                                                {
                                                    icon: '/chat/chatgpt.png',
                                                    name: 'ChatGPT',
                                                    link: 'https://chatgpt.com',
                                                    image: 'https://github.com/kanhaiyadav/assests/blob/main/export-location.png?raw=true'
                                                },
                                                {
                                                    icon: '/chat/claude.png',
                                                    name: 'Claude',
                                                    link: 'https://claude.ai/',
                                                    image: 'https://github.com/kanhaiyadav/assests/blob/main/Screenshot%202025-12-11%20180828.png?raw=true'
                                                },
                                                {
                                                    icon: '/chat/gemini.png',
                                                    name: 'Gemini',
                                                    link: 'https://gemini.google.com/',
                                                    image: 'https://github.com/kanhaiyadav/assests/blob/main/Screenshot%202025-12-14%20222152%20-%20Copy.png?raw=true'
                                                },
                                                {
                                                    icon: '/chat/deepseek.png',
                                                    name: 'Deepseek',
                                                    link: 'https://chat.deepseek.com/',
                                                    image: 'https://github.com/kanhaiyadav/assests/blob/main/Screenshot%202025-12-14%20222316%20-%20Copy.png?raw=true'
                                                }
                                            ].map((platform) => (
                                                <div key={platform.name} className="border border-border rounded-lg p-6 bg-card space-y-4">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <img src={platform.icon} alt={platform.name} className="w-8 h-8" />
                                                        <h3 className="text-xl font-semibold">{platform.name}</h3>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex gap-4">
                                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                                                                1
                                                            </div>
                                                            <p className="text-sm pt-1">
                                                                Visit{' '}
                                                                <a
                                                                    href={platform.link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-primary hover:underline font-semibold"
                                                                >
                                                                    {platform.link}
                                                                </a>
                                                                {' '}and start or open a conversation
                                                            </p>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex gap-4">
                                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                                                                    2
                                                                </div>
                                                                <p className="text-sm pt-1">
                                                                    Click the "ExportMyChat" button {platform.name === 'Deepseek' ? 'at the top left' : 'at the top right'} of the conversation page
                                                                </p>
                                                            </div>
                                                            <img
                                                                src={platform.image}
                                                                alt={`${platform.name} export button location`}
                                                                className="rounded-lg border border-border ml-12 max-w-[690px]"
                                                            />
                                                        </div>

                                                        <div className="flex gap-4">
                                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                                                                3
                                                            </div>
                                                            <p className="text-sm pt-1">
                                                                Edit, customize, and export your chat in your preferred format
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="text-center pt-6 border-t border border-border space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Ready to get started? Visit any supported AI platform and look for the ExportMyChat button!
                                        </p>
                                        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                                            <a href="https://exportmychat.kanhaiya.me/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                                Privacy Policy
                                            </a>
                                            <span>•</span>
                                            <a href="https://exportmychat.kanhaiya.me/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                                Terms & Conditions
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <PreviewContainer
                                    source={chatData?.source || 'chatgpt'}
                                    messages={filteredMessages}
                                    settings={settings}
                                    currentChatId={currentChatId}
                                    artifacts={chatData?.artifacts || []}
                                    chatSaved={chatSaved}
                                    chatChanged={chatChanged}
                                    onSaveChat={handleSaveChat}
                                    onSaveAsChat={handleSaveAsChat}
                                    onExportPDF={handleGeneratePDF}
                                    onOpenInWord={handleOpenInWord}
                                    onExportMarkdown={handleExportMarkdown}
                                    onExportHTML={handleExportHTML}
                                    onExportPlainText={handleExportPlainText}
                                    onExportJSON={handleExportJSON}
                                    onMerge={() => setShowMergeDialog(true)}
                                    onCloseChat={handleCloseChat}
                                    onManageMessages={() => {
                                        // If editor panel is open, request close (handles unsaved changes)
                                        if (showEditorPanel) {
                                            setPendingOpenMessagePanel(true);
                                            editorPanelRef.current?.requestClose();
                                        } else {
                                            setShowMessageManagementPanel(true);
                                        }
                                    }}
                                    editingIndex={editingMessageIndex}
                                    onStartEdit={handleStartEditMessage}
                                    onContentChange={handleContentChange}
                                    onFinishEdit={handleFinishEdit}
                                    isEditingContent={isEditingContent}
                                    onToggleEditContent={() => {
                                        const newEditingState = !isEditingContent;
                                        if (newEditingState) {
                                            // If message management panel is open, request close (handles unsaved changes)
                                            if (showMessageManagementPanel) {
                                                setPendingOpenEditorPanel(true);
                                                messageManagementPanelRef.current?.requestClose();
                                            } else {
                                                setIsEditingContent(true);
                                                setShowEditorPanel(true);
                                            }
                                        } else {
                                            // Also clear editing state when turning off
                                            setIsEditingContent(false);
                                            setShowEditorPanel(false);
                                            setEditingMessageIndex(null);
                                            setEditingElementRef(null);
                                        }
                                    }}
                                />
                                {/* Settings Panel with Editor and Message Management overlays */}
                                <div className='relative h-full overflow-hidden'>
                                    <SettingsPanel
                                        settings={settings}
                                        expandedSections={expandedSections}
                                        currentPresetId={currentPresetId}
                                        settingsChanged={settingsChanged}
                                        presetSaved={presetSaved}
                                        onUpdateSettings={updateSettings}
                                        onToggleSection={toggleSection}
                                        onResetSettings={handleResetSettingsRequest}
                                        onSavePreset={handleSavePreset}
                                        onSaveAsPreset={handleSaveAsPreset}
                                    />
                                    <EditorPanel
                                        ref={editorPanelRef}
                                        isOpen={showEditorPanel}
                                        onClose={handleFinishEdit}
                                        editingMessageIndex={editingMessageIndex}
                                        editingElementRef={editingElementRef}
                                        onSaveContent={handleSaveEditedContent}
                                        onSaveAndClose={() => {
                                            setShowEditorPanel(false);
                                            setIsEditingContent(false);
                                            setEditingMessageIndex(null);
                                            setEditingElementRef(null);
                                        }}
                                        onCloseRequestCancelled={() => setPendingOpenMessagePanel(false)}
                                    />
                                    <MessageManagementPanel
                                        ref={messageManagementPanelRef}
                                        isOpen={showMessageManagementPanel}
                                        onClose={() => setShowMessageManagementPanel(false)}
                                        messages={chatData?.messages || null}
                                        selectedMessages={selectedMessages}
                                        onToggleMessage={handleToggleMessage}
                                        onReorderMessages={handleReorderMessages}
                                        onSaveChanges={handleSaveMessageChanges}
                                        onCloseRequestCancelled={() => setPendingOpenEditorPanel(false)}
                                    />
                                </div>
                            </>
                        )}

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

            <MergeChatsDialog
                isOpen={showMergeDialog}
                onClose={() => setShowMergeDialog(false)}
                currentMessages={chatData?.messages || []}
                onMerge={handleMergeChats}
            />

            <ConfirmationDialog
                open={showPresetWarning}
                title='Apply preset settings?'
                description={pendingPreset ? (
                    <span>
                        Applying the <strong>{pendingPreset.name}</strong> preset will overwrite your current styling and layout settings.
                        This action cannot be undone.
                    </span>
                ) : 'Applying this preset will overwrite your current styling and layout settings. This action cannot be undone.'}
                confirmLabel='Apply preset'
                onConfirm={applyPendingPreset}
                onCancel={cancelPendingPreset}
            />

            <ConfirmationDialog
                open={showResetWarning}
                title={t('resetConfirm.title')}
                description={t('resetConfirm.message')}
                confirmLabel={t('resetConfirm.reset')}
                cancelLabel={t('resetConfirm.cancel')}
                destructive
                onConfirm={resetSettings}
                onCancel={() => setShowResetWarning(false)}
            />



            <BulkExportChatsDialog
                isOpen={showBulkExportDialog}
                onClose={() => setShowBulkExportDialog(false)}
            />

            <ImportChatDialog
                isOpen={showImportDialog}
                onClose={() => setShowImportDialog(false)}
                onImportSuccess={() => {
                    // Optional: refresh sidebar or show a notification
                }}
            />
        </div>
    );
}

export default App;