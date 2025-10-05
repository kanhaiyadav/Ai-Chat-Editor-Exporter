import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/useTheme';
import { Message, PDFSettings, defaultSettings } from './types';
import { getThemeStyles, generatePDF } from './utils';
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
    const [settings, setSettings] = useState<PDFSettings>(defaultSettings);
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        layout: true,
        chatStyle: true,
        qaStyle: false,
        documentStyle: false,
        general: true,
    });
    const { effectiveTheme, loading } = useTheme();

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
        setSettings(prev => ({
            ...prev,
            general: {
                ...prev.general,
                headerText: chatProps?.title || prev.general.headerText
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
        generatePDF(settings);
    };

    const themeStyles = getThemeStyles(settings.general.theme);

    return (
        <div className='flex flex-col items-center h-dvh w-full !overflow-hidden'>
            <Header />

            <div className='flex-1 min-h-0 flex items-center w-full inset-shadow-sm inset-shadow-black/30'>
                <PreviewContainer
                    messages={chatData}
                    settings={settings}
                    themeStyles={themeStyles}
                />

                <SettingsPanel
                    settings={settings}
                    expandedSections={expandedSections}
                    onUpdateSettings={updateSettings}
                    onToggleSection={toggleSection}
                    onResetSettings={resetSettings}
                    onGeneratePDF={handleGeneratePDF}
                />
            </div>
        </div>
    );
}

export default App;