import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Upload, Palette, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ImageFormProps {
    onInsert: (html: string) => void;
    onCancel: () => void;
}

export function ImageForm({ onInsert, onCancel }: ImageFormProps) {
    const { t } = useTranslation();
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
    };

    const handleInsertUrl = () => {
        if (!imageUrl.trim()) {
            alert('Please enter an image URL');
            return;
        }
        insertImage(imageUrl);
    };

    return (
        <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">{t('insertImage.title')}</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCancel}>
                    <X size={14} />
                </Button>
            </div>

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
                    <span className="text-sm font-medium">{t('insertImage.uploadDevice')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        value="url"
                        checked={imageSource === 'url'}
                        onChange={(e) => setImageSource(e.target.value as 'upload' | 'url')}
                        className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">{t('insertImage.fromUrl')}</span>
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
                        {uploadedImageSrc ? t('insertImage.changeImage') : t('insertImage.chooseImage')}
                    </Button>
                    {uploadedImageSrc && (
                        <div className="mt-3 p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground mb-2">{t('insertImage.preview')}:</p>
                            <img src={uploadedImageSrc} alt="preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }} />
                        </div>
                    )}
                </div>
            )}

            {/* URL Section */}
            {imageSource === 'url' && (
                <div>
                    <Label htmlFor="image-url" className="text-sm">
                        {t('insertImage.imageUrl')}
                    </Label>
                    <Input
                        id="image-url"
                        placeholder={t('insertImage.urlPlaceholder')}
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
                        {t('insertImage.width')}
                    </Label>
                    <Input
                        id="img-width"
                        type="number"
                        placeholder={t('insertImage.auto')}
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="mt-1 h-10"
                    />
                </div>
                <div>
                    <Label htmlFor="img-height" className="text-sm">
                        {t('insertImage.height')}
                    </Label>
                    <Input
                        id="img-height"
                        type="number"
                        placeholder={t('insertImage.auto')}
                        value={height === 'auto' ? '' : height}
                        onChange={(e) => setHeight(e.target.value || 'auto')}
                        className="mt-1 h-10"
                    />
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">
                    {t('insertImage.cancel')}
                </Button>
                <Button
                    size="sm"
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
                    className="flex-1"
                >
                    {t('insertImage.insert')}
                </Button>
            </div>
        </div>
    );
}

interface TableFormProps {
    onInsert: (html: string) => void;
    onCancel: () => void;
}

export function TableForm({ onInsert, onCancel }: TableFormProps) {
    const { t } = useTranslation();
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
    };

    return (
        <div className="space-y-4 p-4 border border-border rounded-lg bg-card overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">{t('insertTable.title')}</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCancel}>
                    <X size={14} />
                </Button>
            </div>

            {/* Table Dimensions */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="table-rows" className="text-sm">
                        {t('insertTable.rows')}
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
                        {t('insertTable.columns')}
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
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                        checked={hasHeader}
                        onCheckedChange={(checked) => setHasHeader(checked as boolean)}
                    />
                    <span className="text-sm font-medium">{t('insertTable.includeHeader')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                        checked={alternateRows}
                        onCheckedChange={(checked) => setAlternateRows(checked as boolean)}
                    />
                    <span className="text-sm font-medium">{t('insertTable.alternateRowColors')}</span>
                </label>
            </div>

            {hasHeader && (
                <div>
                    <Label htmlFor="header-color" className="text-sm flex items-center gap-2">
                        <Palette size={16} />
                        {t('insertTable.headerBgColor')}
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
                        {t('insertTable.bodyBgColor')}
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
                            {t('insertTable.alternateRowColor')}
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
                    {t('insertTable.preview')} ({parseInt(rows)} {t('insertTable.rowsX')} {parseInt(cols)} {t('insertTable.cols')}):
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

            <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">
                    {t('insertTable.cancel')}
                </Button>
                <Button size="sm" onClick={insertTable} className="flex-1">
                    {t('insertTable.insert')}
                </Button>
            </div>
        </div>
    );
}

interface LinkFormProps {
    onInsert: (html: string) => void;
    onCancel: () => void;
}

export function LinkForm({ onInsert, onCancel }: LinkFormProps) {
    const { t } = useTranslation();
    const [displayText, setDisplayText] = useState('');
    const [url, setUrl] = useState('');
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
    };

    return (
        <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">{t('insertLink.title')}</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCancel}>
                    <X size={14} />
                </Button>
            </div>

            {/* URL */}
            <div>
                <Label htmlFor="link-url" className="text-sm">
                    {t('insertLink.url')} <span className="text-red-500">*</span>
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
                    {t('insertLink.displayText')}
                </Label>
                <Input
                    id="link-text"
                    placeholder={t('insertLink.emptyUseURL')}
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
                        {t('insertLink.linkColor')}
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
                        {t('insertLink.hoverColor')}
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
                    <span className="text-sm font-medium">{t('insertLink.underlineText')}</span>
                </label>
            </div>

            {/* Preview */}
            <div className="p-3 rounded-lg bg-accent">
                <p className="text-xs mb-2">{t('insertLink.preview')}:</p>
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

            <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">
                    {t('insertLink.cancel')}
                </Button>
                <Button size="sm" onClick={insertLink} className="flex-1">
                    {t('insertLink.insert')}
                </Button>
            </div>
        </div>
    );
}
