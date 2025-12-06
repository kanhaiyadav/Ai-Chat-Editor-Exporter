import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Upload, Palette } from 'lucide-react';

export function ImageDialog({
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
        const widthStyle = width ? `width: ${width}px;` : '';
        const heightStyle = height !== 'auto' ? `height: ${height}px;` : 'height: auto;';
        const imageHtml = `<img src="${src}" alt="image" style="max-width: 100%; ${widthStyle} ${heightStyle} margin: 8px 0; border-radius: 4px; display: block;" />`;
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

export function TableDialog({
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
            <DialogContent className="!max-w-xl bg-card max-h-[90vh] overflow-y-auto">
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
                    <div className="space-y-3">
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
                        <Label className="text-sm mb-2">
                            Preview ({parseInt(rows)} rows × {parseInt(cols)} cols):
                        </Label>
                        <div className="overflow-x-auto text-xs mt-2 border rounded">
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
                                                        Cell
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

export function LinkDialog({
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
        if (!url.trim()) {
            alert('Please enter a URL');
            return;
        }

        const text = displayText.trim() || url;
        const textDecorationStyle = underline ? 'text-decoration: underline;' : 'text-decoration: none;';

        const linkHtml = `<a href="${url}" style="color: ${linkColor}; ${textDecorationStyle}" data-active-color="${activeLinkColor}">${text}</a>`;

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
                    <div className="space-y-3">
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
