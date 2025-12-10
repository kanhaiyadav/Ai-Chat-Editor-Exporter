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
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

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
        <div className="flex flex-wrap gap-1 justify-center" onMouseDown={handleMouseDown}>
            {/* Undo/Redo */}
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('undo')}
                title={t('editor.undo')}
                className="w-9 h-9 p-0"
            >
                <RotateCcw size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('redo')}
                title={t('editor.redo')}
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
                title={t('editor.bold')}
                className="w-9 h-9 p-0"
            >
                <Bold size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('italic')}
                title={t('editor.italic')}
                className="w-9 h-9 p-0"
            >
                <Italic size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('underline')}
                title={t('editor.underline')}
                className="w-9 h-9 p-0"
            >
                <Underline size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('subscript')}
                title={t('editor.subscript')}
                className="w-9 h-9 p-0"
            >
                <Subscript size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('superscript')}
                title={t('editor.superscript')}
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
                title={t('editor.alignLeft')}
                className="w-9 h-9 p-0"
            >
                <AlignLeft size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('justifyCenter')}
                title={t('editor.alignCenter')}
                className="w-9 h-9 p-0"
            >
                <AlignCenter size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('justifyRight')}
                title={t('editor.alignRight')}
                className="w-9 h-9 p-0"
            >
                <AlignRight size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('justifyFull')}
                title={t('editor.justify')}
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
                title={t('editor.heading1')}
                className="w-9 h-9 p-0"
            >
                <Heading1 size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('formatBlock', '<h2>')}
                title={t('editor.heading2')}
                className="w-9 h-9 p-0"
            >
                <Heading2 size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('formatBlock', '<h3>')}
                title={t('editor.heading3')}
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
                title={t('editor.bulletList')}
                className="w-9 h-9 p-0"
            >
                <List size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onFormat('insertOrderedList')}
                title={t('editor.numberedList')}
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
                title={t('editor.codeBlock')}
                className="w-9 h-9 p-0"
            >
                <Code size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={onInsertLink}
                title={t('editor.insertLink')}
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
                title={t('editor.insertTable')}
                className="w-9 h-9 p-0"
            >
                <LucideTable size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={onInsertImage}
                title={t('editor.insertImage')}
                className="w-9 h-9 p-0"
            >
                <ImageIcon size={16} />
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={insertSeparator}
                title={t('editor.insertSeparator')}
                className="w-9 h-9 p-0"
            >
                <Minus size={16} />
            </Button>
        </div>
    );
};
