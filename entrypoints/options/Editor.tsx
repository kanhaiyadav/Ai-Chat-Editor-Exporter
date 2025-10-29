import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
    Image as ImageIcon,
    Minus,
    Link as LinkIcon,
    Palette,
    Settings2,
    LucideTable,
    Upload,
    RotateCcw,
    RotateCw
} from "lucide-react";

interface ChatEditorProps {
    initialHtml: string;
    onChange: (html: string) => void;
    onSave?: () => void;
}

// Image Dialog Component
function ImageDialog({
    open,
    onOpenChange,
    onInsert,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInsert: (html: string) => void;
}) {
    const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
    const [imageUrl, setImageUrl] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('auto');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadedImageSrc, setUploadedImageSrc] = useState<string>('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Image = event.target?.result as string;
            setUploadedImageSrc(base64Image);
        };
        reader.readAsDataURL(file);
    };

    const insertImage = (src: string) => {
        console.log('insertImage called with src length:', src.length);
        const widthStyle = width ? `width: ${width}px;` : '';
        const heightStyle = height !== 'auto' ? `height: ${height}px;` : 'height: auto;';
        const imageHtml = `<img src="${src}" alt="image" style="max-width: 100%; ${widthStyle} ${heightStyle} margin: 8px 0; border-radius: 4px; display: block;" />`;
        console.log('calling onInsert for image');
        onInsert(imageHtml);
        resetForm();
        onOpenChange(false);
    };

    const handleInsertUrl = () => {
        if (!imageUrl.trim()) {
            alert('Please enter an image URL');
            return;
        }
        insertImage(imageUrl);
    };

    const resetForm = () => {
        setImageSource('upload');
        setImageUrl('');
        setWidth('');
        setHeight('auto');
        setUploadedImageSrc('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-card">
                <DialogHeader>
                    <DialogTitle>Insert Image</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Source Selection */}
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="upload"
                                checked={imageSource === 'upload'}
                                onChange={(e) => setImageSource(e.target.value as 'upload' | 'url')}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-medium">Upload from Device</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="url"
                                checked={imageSource === 'url'}
                                onChange={(e) => setImageSource(e.target.value as 'upload' | 'url')}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-medium">From URL</span>
                        </label>
                    </div>

                    <Separator />

                    {/* Upload Section */}
                    {imageSource === 'upload' && (
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                className="w-full h-10 hover:bg-primary/5 hover:text-primary hover:!border-primary"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={16} className="mr-2" />
                                {uploadedImageSrc ? 'Change Image' : 'Choose Image'}
                            </Button>
                            {uploadedImageSrc && (
                                <div className="mt-3 p-2 bg-gray-100 rounded">
                                    <p className="text-xs text-gray-600 mb-2">Preview:</p>
                                    <img src={uploadedImageSrc} alt="preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* URL Section */}
                    {imageSource === 'url' && (
                        <div>
                            <Label htmlFor="image-url" className="text-sm">
                                Image URL
                            </Label>
                            <Input
                                id="image-url"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="mt-1 !h-10"
                            />
                        </div>
                    )}

                    <Separator />

                    {/* Size Settings */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="img-width" className="text-sm">
                                Width (px)
                            </Label>
                            <Input
                                id="img-width"
                                type="number"
                                placeholder="Auto"
                                value={width}
                                onChange={(e) => setWidth(e.target.value)}
                                className="mt-1 h-10"
                            />
                        </div>
                        <div>
                            <Label htmlFor="img-height" className="text-sm">
                                Height (px)
                            </Label>
                            <Input
                                id="img-height"
                                type="number"
                                placeholder="Auto"
                                value={height === 'auto' ? '' : height}
                                onChange={(e) => setHeight(e.target.value || 'auto')}
                                className="mt-1 h-10"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            if (imageSource === 'upload') {
                                if (!uploadedImageSrc) {
                                    alert('Please select an image first');
                                    return;
                                }
                                insertImage(uploadedImageSrc);
                            } else {
                                handleInsertUrl();
                            }
                        }}
                    >
                        Insert Image
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Table Dialog Component
function TableDialog({
    open,
    onOpenChange,
    onInsert,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInsert: (html: string) => void;
}) {
    const [rows, setRows] = useState('3');
    const [cols, setCols] = useState('3');
    const [hasHeader, setHasHeader] = useState(true);
    const [headerBgColor, setHeaderBgColor] = useState('#e5e7eb');
    const [bodyBgColor, setBodyBgColor] = useState('#ffffff');
    const [alternateRows, setAlternateRows] = useState(true);
    const [alternateBgColor, setAlternateBgColor] = useState('#f9fafb');

    const insertTable = () => {
        console.log('insertTable called');
        const rowNum = parseInt(rows);
        const colNum = parseInt(cols);

        if (isNaN(rowNum) || isNaN(colNum) || rowNum < 1 || colNum < 1) {
            alert('Please enter valid numbers');
            return;
        }

        let tableHtml = '<table class="prose" style="width: 100%; border-collapse: collapse; margin: 8px 0;">';

        // Header row
        if (hasHeader) {
            tableHtml += '<thead><tr style="background-color: ' + headerBgColor + ';">';
            for (let j = 0; j < colNum; j++) {
                tableHtml += '<th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; font-weight: bold; background-color: ' + headerBgColor + ';">Header ' + (j + 1) + '</th>';
            }
            tableHtml += '</tr></thead>';
        }

        // Body rows
        tableHtml += '<tbody>';
        for (let i = 0; i < rowNum; i++) {
            const rowBgColor = alternateRows && i % 2 === 1 ? alternateBgColor : bodyBgColor;
            tableHtml += '<tr style="background-color: ' + rowBgColor + ';">';
            for (let j = 0; j < colNum; j++) {
                tableHtml += '<td style="border: 1px solid #d1d5db; padding: 8px;">Cell ' + (i + 1) + ',' + (j + 1) + '</td>';
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table>';

        console.log('tableHtml:', tableHtml);
        console.log('calling onInsert');
        onInsert(tableHtml);
        resetForm();
        onOpenChange(false);
    };

    const resetForm = () => {
        setRows('3');
        setCols('3');
        setHasHeader(true);
        setHeaderBgColor('#e5e7eb');
        setBodyBgColor('#ffffff');
        setAlternateRows(true);
        setAlternateBgColor('#f9fafb');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-xl bg-card">
                <DialogHeader>
                    <DialogTitle>Insert Table</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Table Dimensions */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="table-rows" className="text-sm">
                                Rows
                            </Label>
                            <Input
                                id="table-rows"
                                type="number"
                                min="1"
                                value={rows}
                                onChange={(e) => setRows(e.target.value)}
                                className="mt-1 h-10"
                            />
                        </div>
                        <div>
                            <Label htmlFor="table-cols" className="text-sm">
                                Columns
                            </Label>
                            <Input
                                id="table-cols"
                                type="number"
                                min="1"
                                value={cols}
                                onChange={(e) => setCols(e.target.value)}
                                className="mt-1 h-10"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Header Settings */}
                    <div className="flex items-center gap-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={hasHeader}
                                onCheckedChange={(checked) => setHasHeader(checked as boolean)}
                            />
                            <span className="text-sm font-medium">Include Table Header</span>
                        </label>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={alternateRows}
                                    onCheckedChange={(checked) => setAlternateRows(checked as boolean)}
                                />
                                <span className="text-sm font-medium">Alternate Row Colors</span>
                            </label>
                        </div>
                    </div>

                    {hasHeader && (
                        <div>
                            <Label htmlFor="header-color" className="text-sm flex items-center gap-2">
                                <Palette size={16} />
                                Header Background Color
                            </Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    id="header-color"
                                    type="color"
                                    value={headerBgColor}
                                    onChange={(e) => setHeaderBgColor(e.target.value)}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={headerBgColor}
                                    onChange={(e) => setHeaderBgColor(e.target.value)}
                                    className="flex-1 h-10"
                                    placeholder="#e5e7eb"
                                />
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Body Color Settings */}
                    <div className="flex items-center gap-4">
                        <div>
                            <Label htmlFor="body-color" className="text-sm flex items-center gap-2">
                                <Palette size={16} />
                                Body Background Color
                            </Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    id="body-color"
                                    type="color"
                                    value={bodyBgColor}
                                    onChange={(e) => setBodyBgColor(e.target.value)}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={bodyBgColor}
                                    onChange={(e) => setBodyBgColor(e.target.value)}
                                    className="flex-1 h-10"
                                    placeholder="#ffffff"
                                />
                            </div>
                        </div>



                        {alternateRows && (
                            <div>
                                <Label htmlFor="alternate-color" className="text-sm flex items-center gap-2">
                                    <Palette size={16} />
                                    Alternate Row Color
                                </Label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        id="alternate-color"
                                        type="color"
                                        value={alternateBgColor}
                                        onChange={(e) => setAlternateBgColor(e.target.value)}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={alternateBgColor}
                                        onChange={(e) => setAlternateBgColor(e.target.value)}
                                        className="flex-1 h-10"
                                        placeholder="#f9fafb"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Table Preview */}
                    <div>
                        <Label htmlFor="alternate-color" className="text-sm mb-2">
                            Preview ({parseInt(rows)} rows × {parseInt(cols)} cols):
                        </Label>
                        <div className="overflow-x-auto text-xs">
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                {hasHeader && (
                                    <thead>
                                        <tr style={{ backgroundColor: headerBgColor }}>
                                            {Array.from({ length: Math.min(parseInt(cols), 3) }).map((_, j) => (
                                                <th key={j} style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'left', fontWeight: 'bold' }}>
                                                    H{j + 1}
                                                </th>
                                            ))}
                                            {parseInt(cols) > 3 && <th style={{ border: '1px solid #d1d5db', padding: '4px' }}>...</th>}
                                        </tr>
                                    </thead>
                                )}
                                <tbody>
                                    {Array.from({ length: Math.min(parseInt(rows), 2) }).map((_, i) => {
                                        const rowBgColor = alternateRows && i % 2 === 1 ? alternateBgColor : bodyBgColor;
                                        return (
                                            <tr key={i} style={{ backgroundColor: rowBgColor }}>
                                                {Array.from({ length: Math.min(parseInt(cols), 3) }).map((_, j) => (
                                                    <td key={j} style={{ border: '1px solid #d1d5db', padding: '4px' }}>
                                                        C
                                                    </td>
                                                ))}
                                                {parseInt(cols) > 3 && <td style={{ border: '1px solid #d1d5db', padding: '4px' }}>...</td>}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={insertTable}>Insert Table</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Code Block Dialog Component
function CodeBlockDialog({
    open,
    onOpenChange,
    onInsert,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInsert: (html: string) => void;
}) {
    const [language, setLanguage] = useState('javascript');
    const [fontSize, setFontSize] = useState('14');
    const [headerBgColor, setHeaderBgColor] = useState('#f5f5f5');
    const [headerTextColor, setHeaderTextColor] = useState('#555555');
    const [bgColor, setBgColor] = useState('#fafafa');
    const [textColor, setTextColor] = useState('#333333');
    const [showLanguageLabel, setShowLanguageLabel] = useState(true);

    const insertCodeBlock = () => {
        console.log('insertCodeBlock called');
        const languageLabel = showLanguageLabel ? `<div style="background-color: ${headerBgColor}; color: ${headerTextColor}; padding: 4px 8px; font-size: 12px; border-radius: 4px 4px 0 0; font-weight: bold;">${language}</div>` : '';

        const codeHtml = `<div style="margin: 8px 0; border-radius: 4px; overflow: hidden;">
            <pre class="prose" style="background-color: ${bgColor}; color: ${textColor}; padding: 12px; margin: 0; font-size: ${fontSize}px; overflow-x: auto;"> ${languageLabel} <code class="language-${language}">// ${language} code here</code></pre>
        </div>`;

        console.log('codeHtml:', codeHtml);
        console.log('calling onInsert');
        onInsert(codeHtml);
        resetForm();
        onOpenChange(false);
    };

    const resetForm = () => {
        setLanguage('javascript');
        setFontSize('14');
        setHeaderBgColor('#f5f5f5');
        setHeaderTextColor('#555555');
        setBgColor('#fafafa');
        setTextColor('#333333');
        setShowLanguageLabel(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Insert Code Block</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex gap-4">
                        {/* Language */}
                        <div>
                            <Label htmlFor="language" className="text-sm">
                                Language
                            </Label>
                            <Input
                                id="language"
                                placeholder="e.g., javascript, python, java"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="mt-1 h-10"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Examples: javascript, python, java, typescript, css, html, sql
                            </p>
                        </div>

                        {/* Font Size */}
                        <div>
                            <Label htmlFor="font-size" className="text-sm">
                                Font Size: {fontSize}px
                            </Label>
                            <input
                                id="font-size"
                                type="number"
                                min="10"
                                max="24"
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                                className="w-full mt-1"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Colors */}
                    <div className="space-y-3 flex gap-4">
                        {
                            showLanguageLabel && (
                                <div>
                                    <div>
                                        <Label className="text-sm flex items-center gap-2">
                                            <Palette size={16} />
                                            Language Label Colors
                                        </Label>
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                type="color"
                                                value={headerBgColor}
                                                onChange={(e) => setHeaderBgColor(e.target.value)}
                                                className="w-12 h-10 p-1 cursor-pointer"
                                            />
                                            <Input
                                                type="text"
                                                value={headerBgColor}
                                                onChange={(e) => setHeaderBgColor(e.target.value)}
                                                className="flex-1 h-10"
                                                placeholder="#f5f5f5"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm flex items-center gap-2">
                                            <Palette size={16} />
                                            Language Label Text Color
                                        </Label>
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                type="color"
                                                value={headerTextColor}
                                                onChange={(e) => setHeaderTextColor(e.target.value)}
                                                className="w-12 h-10 p-1 cursor-pointer"
                                            />
                                            <Input
                                                type="text"
                                                value={headerTextColor}
                                                onChange={(e) => setHeaderTextColor(e.target.value)}
                                                className="flex-1 h-10"
                                                placeholder="#f5f5f5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        <div>
                            <div>
                                <Label className="text-sm flex items-center gap-2">
                                    <Palette size={16} />
                                    Background Color
                                </Label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="flex-1 h-10"
                                        placeholder="#1e293b"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm flex items-center gap-2">
                                    <Palette size={16} />
                                    Text Color
                                </Label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="flex-1 h-10"
                                        placeholder="#f1f5f9"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Language Label */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={showLanguageLabel}
                                onCheckedChange={(checked) => setShowLanguageLabel(checked as boolean)}
                            />
                            <span className="text-sm font-medium">Show Language Label</span>
                        </label>
                    </div>

                    {/* Preview */}
                    <div className="p-3 rounded-lg bg-gray-100">
                        <p className="text-xs text-gray-600 mb-2">Preview:</p>
                        <div style={{ borderRadius: '4px', overflow: 'hidden' }}>
                            {showLanguageLabel && (
                                <div style={{ backgroundColor: headerBgColor, color: headerTextColor, padding: '4px 8px', fontSize: '12px', fontWeight: 'bold' }}>
                                    {language}
                                </div>
                            )}
                            <pre style={{ backgroundColor: bgColor, color: textColor, padding: '8px', margin: 0, fontSize: fontSize + 'px', overflow: 'auto' }}>
                                <code>// code preview</code>
                            </pre>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={insertCodeBlock}>Insert Code Block</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Link Dialog Component
function LinkDialog({
    open,
    onOpenChange,
    onInsert,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInsert: (html: string) => void;
}) {
    const [url, setUrl] = useState('');
    const [displayText, setDisplayText] = useState('');
    const [linkColor, setLinkColor] = useState('#0066cc');
    const [activeLinkColor, setActiveLinkColor] = useState('#003399');
    const [underline, setUnderline] = useState(true);

    const insertLink = () => {
        console.log('insertLink called');
        if (!url.trim()) {
            alert('Please enter a URL');
            return;
        }

        const text = displayText.trim() || url;
        const textDecorationStyle = underline ? 'text-decoration: underline;' : 'text-decoration: none;';

        const linkHtml = `<a href="${url}" style="color: ${linkColor}; ${textDecorationStyle}" data-active-color="${activeLinkColor}">${text}</a>`;

        console.log('linkHtml:', linkHtml);
        console.log('calling onInsert');
        onInsert(linkHtml);
        resetForm();
        onOpenChange(false);
    };

    const resetForm = () => {
        setUrl('');
        setDisplayText('');
        setLinkColor('#0066cc');
        setActiveLinkColor('#003399');
        setUnderline(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card">
                <DialogHeader>
                    <DialogTitle>Insert Link</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* URL */}
                    <div>
                        <Label htmlFor="link-url" className="text-sm">
                            URL <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="link-url"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="mt-1 h-10"
                        />
                    </div>

                    {/* Display Text */}
                    <div>
                        <Label htmlFor="link-text" className="text-sm">
                            Display Text
                        </Label>
                        <Input
                            id="link-text"
                            placeholder="Leave empty to use URL"
                            value={displayText}
                            onChange={(e) => setDisplayText(e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <Separator />

                    {/* Colors */}
                    <div className="flex items-center gap-4">
                        <div>
                            <Label className="text-sm flex items-center gap-2">
                                <Palette size={16} />
                                Link Color
                            </Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    type="color"
                                    value={linkColor}
                                    onChange={(e) => setLinkColor(e.target.value)}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={linkColor}
                                    onChange={(e) => setLinkColor(e.target.value)}
                                    className="flex-1 h-10"
                                    placeholder="#0066cc"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm flex items-center gap-2">
                                <Palette size={16} />
                                Active/Hover Color
                            </Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    type="color"
                                    value={activeLinkColor}
                                    onChange={(e) => setActiveLinkColor(e.target.value)}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={activeLinkColor}
                                    onChange={(e) => setActiveLinkColor(e.target.value)}
                                    className="flex-1 h-10"
                                    placeholder="#003399"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Underline Option */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={underline}
                                onCheckedChange={(checked) => setUnderline(checked as boolean)}
                            />
                            <span className="text-sm font-medium">Underline Text</span>
                        </label>
                    </div>

                    {/* Preview */}
                    <div className="p-3 rounded-lg bg-accent">
                        <p className="text-xs mb-2">Preview:</p>
                        <a
                            href={url || '#'}
                            style={{
                                color: linkColor,
                                textDecoration: underline ? 'underline' : 'none',
                            }}
                        >
                            {displayText.trim() || url || 'Link preview'}
                        </a>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={insertLink}>Insert Link</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function ChatEditor({ initialHtml, onChange }: ChatEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);
    const savedRangeRef = useRef<Range | null>(null);

    // Dialog states
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [tableDialogOpen, setTableDialogOpen] = useState(false);
    const [codeBlockDialogOpen, setCodeBlockDialogOpen] = useState(false);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);

    // Set initial content on mount only
    useEffect(() => {
        if (editorRef.current && isInitialMount.current && initialHtml) {
            editorRef.current.innerHTML = initialHtml;
            isInitialMount.current = false;
        }
    }, [initialHtml]);

    const handleInput = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            onChange(newContent);
        }
    };

    const applyFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    const saveCursorPosition = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedRangeRef.current = sel.getRangeAt(0).cloneRange();
            console.log('Cursor position saved');
        }
    };

    const restoreCursorPosition = () => {
        const sel = window.getSelection();
        if (sel && savedRangeRef.current) {
            sel.removeAllRanges();
            sel.addRange(savedRangeRef.current);
            console.log('Cursor position restored');
        }
    };

    const insertElement = (html: string) => {
        console.log('insertElement called with html length:', html.length);
        if (editorRef.current) {
            restoreCursorPosition();
            editorRef.current.focus();
            // Just use execCommand directly - it will insert at current cursor position
            setTimeout(() => {
                const success = document.execCommand('insertHTML', false, html);
                console.log('execCommand result:', success);
                handleInput();
            }, 0);
        } else {
            console.error('editorRef is null!');
        }
    };

    const insertSeparator = () => {
        const separatorHtml = `<hr />`;
        insertElement(separatorHtml);
    };

    return (
        <div className="w-full border border-border rounded-lg overflow-hidden bg-background shadow-sm flex flex-col">
            {/* Dialogs */}
            <ImageDialog
                open={imageDialogOpen}
                onOpenChange={setImageDialogOpen}
                onInsert={insertElement}
            />
            <TableDialog
                open={tableDialogOpen}
                onOpenChange={setTableDialogOpen}
                onInsert={insertElement}
            />
            <CodeBlockDialog
                open={codeBlockDialogOpen}
                onOpenChange={setCodeBlockDialogOpen}
                onInsert={insertElement}
            />
            <LinkDialog
                open={linkDialogOpen}
                onOpenChange={setLinkDialogOpen}
                onInsert={insertElement}
            />

            {/* Toolbar */}
            <div className="bg-accent border-b border-border p-3 flex flex-wrap gap-1">
                {/* Undo/Redo */}
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyFormat('undo')}
                    title="Undo (Ctrl+Z)"
                    className="w-9 h-9 p-0"
                >
                    <RotateCcw size={16} />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyFormat('redo')}
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
                    onClick={() => applyFormat('bold')}
                    title="Bold (Ctrl+B)"
                    className="w-9 h-9 p-0"
                >
                    <Bold size={16} />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyFormat('italic')}
                    title="Italic (Ctrl+I)"
                    className="w-9 h-9 p-0"
                >
                    <Italic size={16} />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyFormat('underline')}
                    title="Underline (Ctrl+U)"
                    className="w-9 h-9 p-0"
                >
                    <Underline size={16} />
                </Button>

                <div className="w-px bg-border mx-1"></div>

                {/* Headings */}
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyFormat('formatBlock', '<h1>')}
                    title="Heading 1"
                    className="w-9 h-9 p-0"
                >
                    <Heading1 size={16} />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyFormat('formatBlock', '<h2>')}
                    title="Heading 2"
                    className="w-9 h-9 p-0"
                >
                    <Heading2 size={16} />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyFormat('formatBlock', '<h3>')}
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
                    onClick={() => applyFormat('insertUnorderedList')}
                    title="Bullet List"
                    className="w-9 h-9 p-0"
                >
                    <List size={16} />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyFormat('insertOrderedList')}
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
                    onClick={() => { saveCursorPosition(); setCodeBlockDialogOpen(true); }}
                    title="Code Block"
                    className="w-9 h-9 p-0"
                >
                    <Code size={16} />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { saveCursorPosition(); setLinkDialogOpen(true); }}
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
                    onClick={() => { saveCursorPosition(); setTableDialogOpen(true); }}
                    title="Insert Table"
                    className="w-9 h-9 p-0"
                >
                    <LucideTable size={16} />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { saveCursorPosition(); setImageDialogOpen(true); }}
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

            {/* Editor Content */}
            <div id="editor" className="bg-white max-h-[400px] overflow-y-auto flex-1" style={{ scrollbarColor: '#bebebe transparent' }}>
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    className="prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3"
                    style={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        color: "#252525"
                    }}
                    suppressContentEditableWarning
                />
            </div>
        </div>
    );
}
