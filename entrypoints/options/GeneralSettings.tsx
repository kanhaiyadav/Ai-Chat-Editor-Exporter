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
                                    General Settings
                                </span>
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="p-4">
                            <div className='space-y-4'>

                                <div>
                                    <Label className='block text-sm font-medium text-foreground/70 mb-2'>Background Color</Label>
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
                                    <Label className='text-sm font-medium text-foreground/70'>Include Header</Label>
                                    <Switch
                                        checked={settings?.includeHeader}
                                        onCheckedChange={(checked) => onUpdate({ includeHeader: checked })}
                                    />
                                </div>

                                {settings?.includeHeader && (
                                    <div>
                                        <Label className='block text-sm font-medium text-foreground/70 mb-2'>Header Text</Label>
                                        <Input
                                            type="text"
                                            value={settings?.headerText}
                                            onChange={(e) => onUpdate({ headerText: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div>
                                    <Label className='block text-sm font-medium text-foreground/70 mb-2'>Font Family</Label>
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
                                                <SelectValue placeholder="Variant" />   
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fontFamilies.find(group => group.type === settings?.fontFamily?.type)?.values.map((variant) => (
                                                    <SelectItem key={variant} value={variant}>
                                                        {variant}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className='flex items-center justify-between'>
                                    <Label className='text-sm font-medium text-foreground/70'>Include AI Generated Images</Label>
                                    <Switch
                                        checked={settings?.includeAIImages}
                                        onCheckedChange={(checked) => onUpdate({ includeAIImages: checked })}
                                    />
                                </div>

                                <div className='flex items-center justify-between'>
                                    <Label className='text-sm font-medium text-foreground/70'>Include User Uploaded Images</Label>
                                    <Switch
                                        checked={settings?.includeUserImages}
                                        onCheckedChange={(checked) => onUpdate({ includeUserImages: checked })}
                                    />
                                </div>

                                <div className='flex items-center justify-between'>
                                    <Label className='text-sm font-medium text-foreground/70'>Include User Uploaded Docs</Label>
                                    <Switch
                                        checked={settings?.includeUserAttachments}
                                        onCheckedChange={(checked) => onUpdate({ includeUserAttachments: checked })}
                                    />
                                </div>

                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
        );
    };