"use client"

import * as React from "react"
import {
    AudioWaveform,
    Command,
    Frame,
    GalleryVerticalEnd,
    Map,
    PieChart,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavChats } from "./nav-chats"
import { NavPresets } from "./nav-presets"
import { ToggleSidebar } from "./team-switcher"
import { BuyMeCoffeeModal } from "@/components/BuyMeCoffeeModal"
import { FeedbackModal } from "@/components/FeedbackModal"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarRail,
} from "@/components/ui/sidebar"
import chatgpt from "@/assets/openai.svg";
import claude from "@/assets/claude.svg";
import gemini from "@/assets/gemini-fill.svg";
import deepseek from "@/assets/deepseek-fill.svg";
import chatgptLight from "@/assets/openai-light.svg";
import claudeLight from "@/assets/claude-light.svg";
import geminiLight from "@/assets/gemini-fill-light.svg";
import deepseekLight from "@/assets/deepseek-fill-light.svg";
import { useLiveQuery } from "dexie-react-hooks"
import { chatOperations, db, presetOperations, SavedChat, SavedPreset } from "@/lib/settingsDB"
import { PDFSettings } from "./types"
import { useTheme } from "@/lib/useTheme"
import { TbMessageReport } from "react-icons/tb"
import { SiBuymeacoffee } from "react-icons/si"
import { FaGithub } from "react-icons/fa6"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    onLoadChat: (chat: SavedChat, preset: PDFSettings | null) => void;
    onLoadPreset: (preset: SavedPreset) => void;
}

export function AppSidebar({ onLoadChat, onLoadPreset, ...props }: AppSidebarProps) {
    const [buyMeCoffeeOpen, setBuyMeCoffeeOpen] = React.useState(false)
    const [feedbackOpen, setFeedbackOpen] = React.useState(false)

    const chats = useLiveQuery(
        () => db.chats.orderBy('updatedAt').reverse().toArray(),
        []
    );

    const presets = useLiveQuery(
        () => db.presets.orderBy('updatedAt').reverse().toArray(),
        []
    );

    const { effectiveTheme } = useTheme();

    const data = {
        user: {
            name: "shadcn",
            email: "m@example.com",
            avatar: "/avatars/shadcn.jpg",
        },
        teams: [
            {
                name: "Acme Inc",
                logo: GalleryVerticalEnd,
                plan: "Enterprise",
            },
            {
                name: "Acme Corp.",
                logo: AudioWaveform,
                plan: "Startup",
            },
            {
                name: "Evil Corp.",
                logo: Command,
                plan: "Free",
            },
        ],
        settingPresets: [
            {
                name: "Design Engineering",
                url: "#",
                icon: Frame,
            },
            {
                name: "Sales & Marketing",
                url: "#",
                icon: PieChart,
            },
            {
                name: "Travel",
                url: "#",
                icon: Map,
            },
        ],
    }


    const [editingChatId, setEditingChatId] = useState<number | null>(null);
    const [editingChatName, setEditingChatName] = useState('');
    const [editingPresetId, setEditingPresetId] = useState<number | null>(null);
    const [editingPresetName, setEditingPresetName] = useState('');
    const [error, setError] = useState('');
    const [showBuyMeCoffee, setShowBuyMeCoffee] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    // Source icons mapping
    const sourceIcons: Record<string, string> = React.useMemo(() => ({
        chatgpt: effectiveTheme !== 'light' ? chatgptLight : chatgpt,
        claude: effectiveTheme !== 'light' ? claudeLight : claude,
        gemini: effectiveTheme !== 'light' ? geminiLight : gemini,
        deepseek: effectiveTheme !== 'light' ? deepseekLight : deepseek,
    }), [effectiveTheme]);


    // Group chats by source
    const chatsBySource = React.useMemo(() => {
        const grouped: Record<string, SavedChat[]> = {
            chatgpt: [],
            claude: [],
            gemini: [],
            deepseek: [],
        };

        chats?.forEach((chat) => {
            if (grouped[chat.source]) {
                grouped[chat.source].push(chat);
            }
        });

        return grouped;
    }, [chats]);

    // Chat handlers
    const handleLoadChat = async (chat: SavedChat) => {
        // Use the stored settings from the chat
        onLoadChat(chat, chat.settings);
    };

    const handleDeleteChat = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this saved chat?')) {
            await chatOperations.deleteChat(id);
        }
    };

    const handleStartEditChat = (chat: SavedChat, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingChatId(chat.id!);
        setEditingChatName(chat.name);
        setError('');
    };

    const handleSaveEditChat = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!editingChatName.trim()) {
            setError('Chat name cannot be empty');
            return;
        }

        const exists = await chatOperations.chatNameExists(editingChatName.trim(), id);
        if (exists) {
            setError('A chat with this name already exists');
            return;
        }

        const chat = chats?.find(c => c.id === id);
        if (chat) {
            await chatOperations.updateChat(
                id,
                editingChatName.trim(),
                chat.title,
                chat.messages,
                chat.source,
                chat.settings
            );
            setEditingChatId(null);
            setEditingChatName('');
            setError('');
        }
    };

    const handleCancelEditChat = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingChatId(null);
        setEditingChatName('');
        setError('');
    };

    const handleDuplicateChat = async (chat: SavedChat, e: React.MouseEvent) => {
        e.stopPropagation();
        let baseName = `${chat.name} (Copy)`;
        let newName = baseName;
        let counter = 1;

        while (await chatOperations.chatNameExists(newName)) {
            newName = `${baseName} ${counter}`;
            counter++;
        }

        await chatOperations.duplicateChat(chat.id!, newName);
    };

    // Preset handlers
    const handleLoadPreset = (preset: SavedPreset, e: React.MouseEvent) => {
        e.stopPropagation();
        onLoadPreset(preset);
    };

    const handleDeletePreset = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this preset?')) {
            await presetOperations.deletePreset(id);
        }
    };

    const handleStartEditPreset = (preset: SavedPreset, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingPresetId(preset.id!);
        setEditingPresetName(preset.name);
        setError('');
    };

    const handleSaveEditPreset = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!editingPresetName.trim()) {
            setError('Preset name cannot be empty');
            return;
        }

        const exists = await presetOperations.presetNameExists(editingPresetName.trim(), id);
        if (exists) {
            setError('A preset with this name already exists');
            return;
        }

        const preset = presets?.find(p => p.id === id);
        if (preset) {
            await presetOperations.updatePreset(id, editingPresetName.trim(), preset.settings);
            setEditingPresetId(null);
            setEditingPresetName('');
            setError('');
        }
    };

    const handleCancelEditPreset = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingPresetId(null);
        setEditingPresetName('');
        setError('');
    };

    const handleDuplicatePreset = async (preset: SavedPreset, e: React.MouseEvent) => {
        e.stopPropagation();
        let baseName = `${preset.name} (Copy)`;
        let newName = baseName;
        let counter = 1;

        while (await presetOperations.presetNameExists(newName)) {
            newName = `${baseName} ${counter}`;
            counter++;
        }

        await presetOperations.duplicatePreset(preset.id!, newName);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleStarRepo = () => {
        window.open('https://github.com/kanhaiyadav/Ai-Chat-Editor-Exporter', '_blank');
    };

    return (
        <>
            <Sidebar collapsible="icon" {...props} className={effectiveTheme === 'light' ? 'h-full !border-t-[3px] !border-[#bbbbbb] dark:border-0' : 'h-full'}>
                <SidebarHeader className="">
                    <ToggleSidebar teams={data.teams} />
                </SidebarHeader>
                <SidebarContent>
                    <NavChats
                        chats={chats || []}
                        chatsBySource={chatsBySource}
                        sourceIcons={sourceIcons}
                        handleLoadChat={handleLoadChat}
                        editingChatId={editingChatId}
                        editingChatName={editingChatName}
                        setEditingChatName={setEditingChatName}
                        handleStartEditChat={handleStartEditChat}
                        handleSaveEditChat={handleSaveEditChat}
                        handleCancelEditChat={handleCancelEditChat}
                        handleDeleteChat={handleDeleteChat}
                        handleDuplicateChat={handleDuplicateChat}
                        formatDate={formatDate}
                        error={error}
                    />
                    <NavPresets
                        presets={presets || []}
                        handleLoadPreset={handleLoadPreset}
                        editingPresetId={editingPresetId}
                        editingPresetName={editingPresetName}
                        setEditingPresetName={setEditingPresetName}
                        handleStartEditPreset={handleStartEditPreset}
                        handleSaveEditPreset={handleSaveEditPreset}
                        handleCancelEditPreset={handleCancelEditPreset}
                        setError={setError}
                        error={error}
                        formatDate={formatDate}
                        handleDeletePreset={handleDeletePreset}
                        handleDuplicatePreset={handleDuplicatePreset}
                    />
                </SidebarContent>
                <SidebarFooter>
                    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                        <SidebarGroupLabel>Contribute</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuButton
                                onClick={() => setBuyMeCoffeeOpen(true)}
                                className="w-full hover:bg-card p-2 py-1 rounded-sm flex items-center"
                            >
                                <SiBuymeacoffee />
                                <span className="font-semibold">Buy Me a Coffee</span>
                            </SidebarMenuButton>
                            <SidebarMenuButton
                                onClick={() => setFeedbackOpen(true)}
                                className="w-full hover:bg-card p-2 py-1 rounded-sm flex items-center"
                            >
                                <TbMessageReport />
                                <span className="font-semibold">Send Feedback</span>
                            </SidebarMenuButton>
                            <a
                                href="https://github.com/kanhaiyadav/Ai-Chat-Editor-Exporter"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full hover:bg-card p-2 py-1 rounded-sm flex gap-2 items-center"
                            >
                                <FaGithub size={16} />
                                <span className="font-semibold text-sm">Star on GitHub</span>
                            </a>
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>

            <BuyMeCoffeeModal open={buyMeCoffeeOpen} onOpenChange={setBuyMeCoffeeOpen} />
            <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
        </>
    )
}
