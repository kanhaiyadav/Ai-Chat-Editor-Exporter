import { Save, SaveAll, Check, Download, X, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaRegFilePdf } from "react-icons/fa6";
import { PiGitMerge } from "react-icons/pi";
import { useState, useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImHtmlFive2 } from "react-icons/im";
import { IoLogoMarkdown } from "react-icons/io5";
import { FaFileWord } from "react-icons/fa6";
import { FaFilePdf } from "react-icons/fa6";
import { LuFileText } from "react-icons/lu";
import { VscJson } from "react-icons/vsc";
import { useTranslation } from 'react-i18next';
import { PiChatsLight } from "react-icons/pi";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PreviewToolbarProps {
    currentChatId: number | null;
    chatSaved: boolean;
    chatChanged: boolean;
    onSaveChat: () => void;
    onSaveAsChat: () => void;
    onExportPDF: () => void;
    onOpenInWord: () => void;
    onExportMarkdown: () => void;
    onExportHTML: () => void;
    onExportPlainText: () => void;
    onExportJSON: () => void;
    onMerge: () => void;
    onCloseChat?: () => void;
    onManageMessages?: () => void;
}

export const PreviewToolbar = ({
    currentChatId,
    chatSaved,
    chatChanged,
    onSaveChat,
    onSaveAsChat,
    onExportPDF,
    onOpenInWord,
    onExportMarkdown,
    onExportHTML,
    onExportPlainText,
    onExportJSON,
    onMerge,
    onCloseChat,
    onManageMessages,

}: PreviewToolbarProps) => {
    const { t } = useTranslation();

    const [chatDataExists, setChatDataExists] = useState(false);

    useEffect(() => {
        chrome.storage.local.get(['chatData']).then((result) => {
            if (result.chatData) {
                setChatDataExists(result.chatData.messages.length > 0);
            } else {
                setChatDataExists(false);
            }
        });

        const listener = () => {
            chrome.storage.local.get(['chatData']).then((result) => {
                if (result.chatData) {
                    setChatDataExists(result.chatData.messages.length > 0);
                } else {
                    setChatDataExists(false);
                }
            });
        };
        chrome.storage.onChanged.addListener(listener);
        return () => {
            chrome.storage.onChanged.removeListener(listener);
        };
    }, [currentChatId]);

    const handleCloseChat = () => {
        if (onCloseChat) {
            onCloseChat();
        }
    };

    if (!chatDataExists) {
        return null;
    }

    return (
        <div className='sticky top-0 z-10 bg-accent border-b border-border/40 px-4 py-2 flex items-center justify-between gap-2 !rounded-none'>
            {/* Left side - Chat actions */}
            <div className='flex items-center w-full'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            className="gap-2 [&_svg:not([class*='size-'])]:size-4 mr-1"
                        >
                            <Download />
                            {t('preview.export')}
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem onClick={onExportPDF} className="gap-2 cursor-pointer [&_svg:not([class*='size-'])]:size-5">
                            <FaFilePdf className='text-red-500' />
                            <span>{t('preview.exportPDF')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onOpenInWord} className="gap-2 cursor-pointer [&_svg:not([class*='size-'])]:size-5">
                            <FaFileWord className="h-4 w-4 text-blue-500" />
                            <span>{t('preview.exportWord')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExportJSON} className="gap-2 cursor-pointer [&_svg:not([class*='size-'])]:size-6 -ml-0.5">
                            <VscJson className="h-4 w-4 text-purple-500" />
                            <span className='-ml-0.5'>{t('preview.exportJSON')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExportMarkdown} className="gap-2 cursor-pointer [&_svg:not([class*='size-'])]:size-5">
                            <IoLogoMarkdown className="h-4 w-4 text-yellow-600" />
                            <span>{t('preview.exportMarkdown')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExportHTML} className="gap-2 cursor-pointer [&_svg:not([class*='size-'])]:size-5">
                            <ImHtmlFive2 className="h-4 w-4 text-[#e86025]" />
                            <span>{t('preview.exportHTML')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExportPlainText} className="gap-2 cursor-pointer [&_svg:not([class*='size-'])]:size-5">
                            <LuFileText className="h-4 w-4 text-foreground" />
                            <span>{t('preview.exportText')}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {currentChatId !== null ? (
                    <>
                        <Button
                            onClick={onSaveChat}
                            variant="ghost"
                            size="sm"
                            className="gap-2 [&_svg:not([class*='size-'])]:size-5"
                            disabled={!chatChanged}
                        >
                            {chatSaved ? (
                                <>
                                    <Check size={16} className='text-green-500' />
                                    {t('preview.saved')}
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    {t('preview.save')}
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={onSaveAsChat}
                            variant="ghost"
                            size="sm"
                            className='gap-2'
                        >
                            <SaveAll size={16} />
                            {t('preview.saveAs')}
                        </Button>
                    </>
                ) : (
                    <Button
                        onClick={onSaveAsChat}
                        variant="ghost"
                        size="sm"
                        className='gap-2'
                    >
                        <SaveAll size={16} />
                        {t('preview.saveAs')}
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 [&_svg:not([class*='size-'])]:size-5"
                    onClick={onManageMessages}
                >
                    <PiChatsLight size={16} />
                    {t('preview.manageMessages')}
                </Button>

                <Button
                    onClick={onMerge}
                    size="sm"
                    className="gap-2 [&_svg:not([class*='size-'])]:size-5"
                    variant="ghost"
                >
                    <PiGitMerge size={16} />
                    {t('preview.mergeChats')}
                </Button>
                {
                    (currentChatId || chatDataExists) && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={'ghost'}
                                    size="sm"
                                    className="ml-auto gap-2 !bg-red-500/10 group border border-red-500/40 hover:!bg-red-500/20 [&_svg:not([class*='size-'])]:size-[22px]"
                                    onClick={handleCloseChat}
                                >
                                    <X className='text-red-600 group-hover:text-red-500' />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('preview.closeChat')}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
            </div>
        </div>
    );
};

