import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PDFSettings } from './types';

interface DocumentSettingsProps {
    settings: PDFSettings['document'];
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (updates: Partial<PDFSettings['document']>) => void;
}

export const DocumentSettings = ({ settings, isExpanded, onToggle, onUpdate }: DocumentSettingsProps) => {
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
                            Document Style
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </CardTitle>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="p-4">
                        <div className='space-y-4'>
                            <ColorInput
                                label="Title Color"
                                value={settings.titleColor}
                                onChange={(value) => onUpdate({ titleColor: value })}
                            />
                            <ColorInput
                                label="Body Color"
                                value={settings.bodyColor}
                                onChange={(value) => onUpdate({ bodyColor: value })}
                            />

                            <div>
                                <div className='flex items-center justify-between mb-2'>
                                    <Label className='text-sm font-medium text-foreground/70'>Font Size</Label>
                                    <span className='text-sm font-semibold text-amber-600'>{settings.fontSize}</span>
                                </div>
                                <Slider
                                    value={[settings.fontSize]}
                                    onValueChange={(values) => onUpdate({ fontSize: values[0] })}
                                    min={10}
                                    max={20}
                                    step={1}
                                />
                            </div>

                            <div>
                                <div className='flex items-center justify-between mb-2'>
                                    <Label className='text-sm font-medium text-foreground/70'>Line Height</Label>
                                    <span className='text-sm font-semibold text-amber-600'>{settings.lineHeight}</span>
                                </div>
                                <Slider
                                    value={[settings.lineHeight]}
                                    onValueChange={(values) => onUpdate({ lineHeight: values[0] })}
                                    min={1.2}
                                    max={2.5}
                                    step={0.1}
                                />
                            </div>

                            <div>
                                <div className='flex items-center justify-between mb-2'>
                                    <Label className='text-sm font-medium text-foreground/70'>Paragraph Spacing</Label>
                                    <span className='text-sm font-semibold text-amber-600'>{settings.paragraphSpacing}</span>
                                </div>
                                <Slider
                                    value={[settings.paragraphSpacing]}
                                    onValueChange={(values) => onUpdate({ paragraphSpacing: values[0] })}
                                    min={8}
                                    max={40}
                                    step={1}
                                />
                            </div>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};