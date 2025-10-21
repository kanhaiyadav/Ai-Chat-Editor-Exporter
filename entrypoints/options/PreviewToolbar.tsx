import { Save, SaveAll, FileDown, ZoomIn, ZoomOut, RotateCcw, Menu, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

interface PreviewToolbarProps {
    currentChatId: number | null;
    zoom: number;
    chatSaved: boolean;
    chatChanged: boolean;
    onSaveChat: () => void;
    onSaveAsChat: () => void;
    onExportPDF: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
}

export const PreviewToolbar = ({
    currentChatId,
    zoom,
    chatSaved,
    chatChanged,
    onSaveChat,
    onSaveAsChat,
    onExportPDF,
    onZoomIn,
    onZoomOut,
    onResetZoom,
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
                            variant="secondary"
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
                            variant="outline"
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
                        variant="secondary"
                        size="sm"
                        className='gap-2'
                    >
                        <SaveAll size={16} />
                        Save As
                    </Button>
                )}
            </div>

            {/* Right side - Zoom controls */}
            <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground min-w-[60px] text-center'>
                    {Math.round(zoom * 100)}%
                </span>
                <Button
                    onClick={onZoomOut}
                    variant="ghost"
                    size="sm"
                    disabled={zoom <= 0.5}
                    className='h-8 w-8 p-0'
                    title='Zoom Out'
                >
                    <ZoomOut size={16} />
                </Button>
                <Button
                    onClick={onResetZoom}
                    variant="ghost"
                    size="sm"
                    className='h-8 w-8 p-0'
                    title='Reset Zoom'
                >
                    <RotateCcw size={14} />
                </Button>
                <Button
                    onClick={onZoomIn}
                    variant="ghost"
                    size="sm"
                    disabled={zoom >= 2}
                    className='h-8 w-8 p-0'
                    title='Zoom In'
                >
                    <ZoomIn size={16} />
                </Button>
            </div>
        </div>
    );
};
