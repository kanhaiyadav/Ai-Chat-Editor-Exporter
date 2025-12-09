import { Button } from "@/components/ui/button";
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Code,
    Link as LinkIcon,
    LucideTable,
    Image as ImageIcon,
    Minus,
    RotateCcw,
    RotateCw,
    Subscript,
    Superscript,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify
} from "lucide-react";

interface EditorToolbarProps {
    onFormat: (command: string, value?: string) => void;
    onInsertImage: () => void;
    onInsertTable: () => void;
    onInsertCodeBlock: () => void;
    onInsertLink: () => void;
}

export const EditorToolbar = ({
    onFormat,
    onInsertImage,
    onInsertTable,
    onInsertCodeBlock,
    onInsertLink
}: EditorToolbarProps) => {
    const insertSeparator = () => {
        onFormat('insertHTML', '<hr />');
    };

    // Prevent blur when clicking toolbar buttons
    const handleMouseDown = (e: React.MouseEvent) => {
        // Only prevent default if clicking on a button, not other elements
        if ((e.target as HTMLElement).closest('button')) {
            e.preventDefault();
        }
    };

    return (
        <div className="flex flex-wrap gap-1" onMouseDown={handleMouseDown}>
            {/* Undo/Redo */}
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('undo')}
                title="Undo (Ctrl+Z)"
                className="w-9 h-9 p-0"
            >
                <RotateCcw size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('redo')}
                title="Redo (Ctrl+Y)"
                className="w-9 h-9 p-0"
            >
                <RotateCw size={16} />
            </Button>

            <div className="w-px bg-border mx-1"></div>

            {/* Text Formatting */}
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('bold')}
                title="Bold (Ctrl+B)"
                className="w-9 h-9 p-0"
            >
                <Bold size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('italic')}
                title="Italic (Ctrl+I)"
                className="w-9 h-9 p-0"
            >
                <Italic size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('underline')}
                title="Underline (Ctrl+U)"
                className="w-9 h-9 p-0"
            >
                <Underline size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('subscript')}
                title="Subscript"
                className="w-9 h-9 p-0"
            >
                <Subscript size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('superscript')}
                title="Superscript"
                className="w-9 h-9 p-0"
            >
                <Superscript size={16} />
            </Button>

            <div className="w-px bg-border mx-1"></div>

            {/* Text Alignment */}
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('justifyLeft')}
                title="Align Left"
                className="w-9 h-9 p-0"
            >
                <AlignLeft size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('justifyCenter')}
                title="Align Center"
                className="w-9 h-9 p-0"
            >
                <AlignCenter size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('justifyRight')}
                title="Align Right"
                className="w-9 h-9 p-0"
            >
                <AlignRight size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('justifyFull')}
                title="Justify"
                className="w-9 h-9 p-0"
            >
                <AlignJustify size={16} />
            </Button>

            <div className="w-px bg-border mx-1"></div>

            {/* Headings */}
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('formatBlock', '<h1>')}
                title="Heading 1"
                className="w-9 h-9 p-0"
            >
                <Heading1 size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('formatBlock', '<h2>')}
                title="Heading 2"
                className="w-9 h-9 p-0"
            >
                <Heading2 size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('formatBlock', '<h3>')}
                title="Heading 3"
                className="w-9 h-9 p-0"
            >
                <Heading3 size={16} />
            </Button>

            <div className="w-px bg-border mx-1"></div>

            {/* Lists */}
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('insertUnorderedList')}
                title="Bullet List"
                className="w-9 h-9 p-0"
            >
                <List size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('insertOrderedList')}
                title="Numbered List"
                className="w-9 h-9 p-0"
            >
                <ListOrdered size={16} />
            </Button>

            <div className="w-px bg-border mx-1"></div>

            {/* Code & Special */}
            <Button
                size="sm"
                variant="outline"
                onClick={onInsertCodeBlock}
                title="Code Block"
                className="w-9 h-9 p-0"
            >
                <Code size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={onInsertLink}
                title="Insert Link"
                className="w-9 h-9 p-0 text-xs"
            >
                <LinkIcon size={16} />
            </Button>

            <div className="w-px bg-border mx-1"></div>

            {/* Table & Media */}
            <Button
                size="sm"
                variant="outline"
                onClick={onInsertTable}
                title="Insert Table"
                className="w-9 h-9 p-0"
            >
                <LucideTable size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={onInsertImage}
                title="Insert Image"
                className="w-9 h-9 p-0"
            >
                <ImageIcon size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={insertSeparator}
                title="Insert Separator"
                className="w-9 h-9 p-0"
            >
                <Minus size={16} />
            </Button>
        </div>
    );
};
