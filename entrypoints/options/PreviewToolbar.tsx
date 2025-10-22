import { Save, SaveAll, FileDown, Menu, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

interface PreviewToolbarProps {
    currentChatId: number | null;
    chatSaved: boolean;
    chatChanged: boolean;
    onSaveChat: () => void;
    onSaveAsChat: () => void;
    onExportPDF: () => void;
}

export const PreviewToolbar = ({
    currentChatId,
    chatSaved,
    chatChanged,
    onSaveChat,
    onSaveAsChat,
    onExportPDF,
}: PreviewToolbarProps) => {

    const { open, setOpen } = useSidebar();

    return (
        <div className='sticky top-0 z-10 bg-accent border-b border-border/40 px-4 py-2 flex items-center justify-between gap-2 !rounded-none'>
            {/* Left side - Chat actions */}
            <div className='flex items-center gap-2'>
                <Button
                    onClick={() => setOpen(!open)}
                    variant="ghost"
                    size="sm"
                >
                    <Menu size={16} />
                </Button>
                <Button
                    onClick={onExportPDF}
                    size="sm"
                    className='gap-2'
                >
                    <FileDown size={16} />
                    Export PDF
                </Button>

                {currentChatId !== null ? (
                    <>
                        <Button
                            onClick={onSaveChat}
                            variant="ghost"
                            size="sm"
                            className='gap-2'
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
