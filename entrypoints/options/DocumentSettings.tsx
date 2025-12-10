import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PDFSettings } from './types';
import { RiBrushAiLine } from "react-icons/ri";

interface DocumentSettingsProps {
    settings: PDFSettings['document'];
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (updates: Partial<PDFSettings['document']>) => void;
}

export const DocumentSettings = ({ settings, isExpanded, onToggle, onUpdate }: DocumentSettingsProps) => {
    const { t } = useTranslation();
    const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
        <div>
            <Label className='block text-sm font-medium text-foreground/70 mb-2'>{label}</Label>
            <div className='flex items-center gap-3'>
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className='h-10 w-16 rounded cursor-pointer border-2 border-gray-300'
                />
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className='flex-1'
                    placeholder="#000000"
                />
            </div>
        </div>
    );

    return (
        <Card className="shadow-sm border border-gray-200">
            <Collapsible open={isExpanded} onOpenChange={onToggle}>
                <CollapsibleTrigger asChild className='mb-[-3px]'>
                    <CardHeader className="px-4 cursor-pointer">
                        <CardTitle className="flex items-center justify-between font-semibold">
                            <span className="flex items-center gap-2">
                                <RiBrushAiLine size={20} />
                                {t('settings.documentStyle.title')}
                            </span>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </CardTitle>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="p-4">
                        <div className='space-y-4'>
                            <ColorInput
                                label={t('settings.documentStyle.titleColor')}
                                value={settings.titleColor}
                                onChange={(value) => onUpdate({ titleColor: value })}
                            />
                            <ColorInput
                                label={t('settings.documentStyle.bodyColor')}
                                value={settings.bodyColor}
                                onChange={(value) => onUpdate({ bodyColor: value })}
                            />
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};