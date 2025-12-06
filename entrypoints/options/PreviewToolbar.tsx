import { Save, SaveAll, Check, Download, X, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaRegFilePdf } from "react-icons/fa6";
import { PiGitMerge } from "react-icons/pi";
import { BsFiletypeJson, BsFiletypeHtml, BsFiletypeMd, BsFiletypeTxt, BsFiletypeDoc, BsFiletypePdf } from "react-icons/bs";
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
    onMerge: () => void;
    onExportChat?: () => void;
    onCloseChat?: () => void;
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
    onMerge,
    onExportChat,
    onCloseChat,
}: PreviewToolbarProps) => {

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
            <div className='flex items-center gap-2 w-full'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            className="gap-2 [&_svg:not([class*='size-'])]:size-4"
                        >
                            <Download />
                            Export
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem onClick={onExportPDF} className="gap-2 cursor-pointer [&_svg:not([class*='size-'])]:size-5">
                            <FaFilePdf className='text-red-500'/>
                            <span>Export as PDF</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onOpenInWord} className="gap-2 cursor-pointer [&_svg:not([class*='size-'])]:size-5">
                            <FaFileWord className="h-4 w-4 text-blue-500" />
                            <span>Export as Word (.doc)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExportMarkdown} className="gap-2 cursor-pointer [&_svg:not([class*='size-'])]:size-5">
                            <IoLogoMarkdown className="h-4 w-4 text-yellow-600" />
                            <span>Export as Markdown</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExportHTML} className="gap-2 cursor-pointer [&_svg:not([class*='size-'])]:size-5">
                            <ImHtmlFive2 className="h-4 w-4 text-[#e86025]" />
                            <span>Export as HTML</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExportPlainText} className="gap-2 cursor-pointer [&_svg:not([class*='size-'])]:size-5">
                            <LuFileText className="h-4 w-4 text-foreground" />
                            <span>Export as Plain Text</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    onClick={onMerge}
                    size="sm"
                    className="gap-2 [&_svg:not([class*='size-'])]:size-5"
                    variant="ghost"
                >
                    <PiGitMerge size={16} />
                    Merge Chats
                </Button>

                {onExportChat && currentChatId !== null && (
                    <Button
                        onClick={onExportChat}
                        size="sm"
                        className="gap-2 [&_svg:not([class*='size-'])]:size-5"
                        variant="ghost"
                    >
                        <BsFiletypeJson />
                        Export Chat
                    </Button>
                )}

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
                                    Saved
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save
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
                            Save As
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
                        Save As
                    </Button>
                )}
                {
                    (currentChatId || chatDataExists) && (
                        <Button
                            variant={'ghost'}
                            size="sm"
                            className="ml-auto gap-2 !bg-red-500/10 group"
                            onClick={handleCloseChat}
                        >
                            <X className='text-red-600 group-hover:text-red-500' />
                            <span className='text-red-600 group-hover:text-red-500'>Close chat</span>
                        </Button>
                    )}
            </div>
        </div>
    );
};

