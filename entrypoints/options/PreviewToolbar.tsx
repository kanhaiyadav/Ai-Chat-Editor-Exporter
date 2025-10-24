import { Save, SaveAll, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaRegFilePdf } from "react-icons/fa6";
import { PiGitMerge } from "react-icons/pi";
import { BsFiletypeJson } from "react-icons/bs";

interface PreviewToolbarProps {
    currentChatId: number | null;
    chatSaved: boolean;
    chatChanged: boolean;
    onSaveChat: () => void;
    onSaveAsChat: () => void;
    onExportPDF: () => void;
    onMerge: () => void;
    onExportChat?: () => void;
}

export const PreviewToolbar = ({
    currentChatId,
    chatSaved,
    chatChanged,
    onSaveChat,
    onSaveAsChat,
    onExportPDF,
    onMerge,
    onExportChat,
}: PreviewToolbarProps) => {


    return (
        <div className='sticky top-0 z-10 bg-accent border-b border-border/40 px-4 py-2 flex items-center justify-between gap-2 !rounded-none'>
            {/* Left side - Chat actions */}
            <div className='flex items-center gap-2'>
                <Button
                    onClick={onExportPDF}
                    size="sm"
                    className="gap-2 [&_svg:not([class*='size-'])]:size-5"
                >
                    <FaRegFilePdf />
                    Export PDF
                </Button>

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
            </div>
        </div>
    );
};
