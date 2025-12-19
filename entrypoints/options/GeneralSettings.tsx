import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fontFamilies, PDFSettings } from './types';
import { LuSettings } from "react-icons/lu";

interface GeneralSettingsProps {
    settings: PDFSettings['general'];
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (updates: Partial<PDFSettings['general']>) => void;
}

export const GeneralSettings = ({ settings, isExpanded, onToggle, onUpdate }: GeneralSettingsProps) => {
    const { t } = useTranslation();
    const [systemFonts, setSystemFonts] = useState<string[]>([]);

    // Detect system fonts
    useEffect(() => {
        const detectSystemFonts = async () => {
            // Common system fonts to check
            const commonFonts = [
                'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia',
                'Impact', 'Lucida Console', 'Lucida Sans Unicode', 'Palatino Linotype',
                'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'MS Sans Serif',
                // Windows fonts
                'Calibri', 'Cambria', 'Candara', 'Consolas', 'Constantia', 'Corbel',
                'Franklin Gothic Medium', 'Gabriola', 'Segoe UI',
                // macOS fonts
                'American Typewriter', 'Baskerville', 'Brush Script MT', 'Copperplate',
                'Didot', 'Futura', 'Geneva', 'Gill Sans', 'Helvetica', 'Helvetica Neue',
                'Hoefler Text', 'Lucida Grande', 'Marker Felt', 'Monaco', 'Optima',
                'Papyrus', 'Rockwell',
                // Linux fonts
                'Ubuntu', 'Ubuntu Mono', 'DejaVu Sans', 'DejaVu Serif', 'Liberation Sans',
                'Liberation Serif', 'Noto Sans', 'Noto Serif', 'Roboto', 'Droid Sans',
            ];

            const availableFonts: string[] = [];

            for (const font of commonFonts) {
                try {
                    const fontFace = new FontFace(font, `local("${font}")`);
                    await fontFace.load();
                    availableFonts.push(font);
                } catch {
                    // Font not available
                }
            }

            setSystemFonts(availableFonts.sort());
        };

        detectSystemFonts();
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty('--pdf-background', settings?.backgroundColor);
    }, [settings?.backgroundColor]);

    const handleColorChange = (value: string) => {
        onUpdate({ backgroundColor: value });
    }

    return (
        <Card className="shadow-sm border border-gray-200">
            <Collapsible open={isExpanded} onOpenChange={onToggle}>
                <CollapsibleTrigger asChild>
                    <CardHeader className="px-4 cursor-pointer mb-[-3px]">
                        <CardTitle className="flex items-center justify-between font-semibold">
                            <span className="flex items-center gap-2">
                                <LuSettings size={20} />
                                {t('settings.general.title')}
                            </span>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </CardTitle>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="p-4">
                        <div className='space-y-4'>

                            <div>
                                <Label className='block text-sm font-medium text-foreground/70 mb-2'>{t('settings.general.backgroundColor')}</Label>
                                <div className='flex items-center gap-3'>
                                    <input
                                        type="color"
                                        value={settings?.backgroundColor}
                                        onChange={(e) => handleColorChange(e.target.value)}
                                        className='h-10 w-16 rounded cursor-pointer border-2 border-gray-300'
                                    />
                                    <Input
                                        type="text"
                                        value={settings?.backgroundColor}
                                        onChange={(e) => handleColorChange(e.target.value)}
                                        className='flex-1'
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>

                            <div className='flex items-center justify-between'>
                                <Label className='text-sm font-medium text-foreground/70'>{t('settings.general.includeHeader')}</Label>
                                <Switch
                                    checked={settings?.includeHeader}
                                    onCheckedChange={(checked) => onUpdate({ includeHeader: checked })}
                                />
                            </div>

                            {settings?.includeHeader && (
                                <div>
                                    <Label className='block text-sm font-medium text-foreground/70 mb-2'>{t('settings.general.headerText')}</Label>
                                    <Input
                                        type="text"
                                        value={settings?.headerText}
                                        onChange={(e) => onUpdate({ headerText: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <Label className='block text-sm font-medium text-foreground/70 mb-2'>{t('settings.general.fontFamily')}</Label>
                                <div className='flex'>
                                    <Select value={settings?.fontFamily?.type} onValueChange={(value) => onUpdate({ fontFamily: { type: value, value: settings.fontFamily?.value || '' } })}>
                                        <SelectTrigger className="w-[130px]">
                                            <SelectValue placeholder="Select a font family" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fontFamilies.map((group) => (
                                                <SelectItem key={group.type} value={group.type}>
                                                    {group.type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={settings?.fontFamily?.value} onValueChange={(value) => onUpdate({ fontFamily: { type: settings.fontFamily?.type || '', value } })}>
                                        <SelectTrigger className="flex-1 ml-2">
                                            <SelectValue placeholder={t('settings.general.variant')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {settings?.fontFamily?.type === t('settings.general.custom') ? (
                                                systemFonts.map((font) => (
                                                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                                        {font}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                fontFamilies.find(group => group.type === settings?.fontFamily?.type)?.values.map((variant) => (
                                                    <SelectItem key={variant} value={variant}>
                                                        {variant}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className='flex gap-4'>
                                <div className='flex-1'>
                                    <div className='flex items-center justify-between mb-2'>
                                        <Label className='text-sm font-medium text-foreground/70'>{t('settings.general.fontSize')}</Label>
                                        <span className='text-sm font-semibold text-amber-600'>{settings?.fontSize}</span>
                                    </div>
                                    <Slider
                                        value={[settings?.fontSize || 16]}
                                        onValueChange={(values) => onUpdate({ fontSize: values[0] })}
                                        min={10}
                                        max={24}
                                        step={1}
                                    />
                                </div>

                                <div className='flex-1'>
                                    <div className='flex items-center justify-between mb-2'>
                                        <Label className='text-sm font-medium text-foreground/70'>{t('settings.general.lineHeight')}</Label>
                                        <span className='text-sm font-semibold text-amber-600'>{settings?.lineHeight}</span>
                                    </div>
                                    <Slider
                                        value={[settings?.lineHeight || 1.6]}
                                        onValueChange={(values) => onUpdate({ lineHeight: values[0] })}
                                        min={1.2}
                                        max={2.5}
                                        step={0.1}
                                    />
                                </div>
                            </div>

                            <div className='flex items-center justify-between'>
                                <Label className='text-sm font-medium text-foreground/70'>{t('settings.general.includeAIImages')}</Label>
                                <Switch
                                    checked={settings?.includeAIImages}
                                    onCheckedChange={(checked) => onUpdate({ includeAIImages: checked })}
                                />
                            </div>

                            <div className='flex items-center justify-between'>
                                <Label className='text-sm font-medium text-foreground/70'>{t('settings.general.includeUserImages')}</Label>
                                <Switch
                                    checked={settings?.includeUserImages}
                                    onCheckedChange={(checked) => onUpdate({ includeUserImages: checked })}
                                />
                            </div>

                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};