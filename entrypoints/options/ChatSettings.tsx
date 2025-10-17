import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PDFSettings } from './types';

interface ChatSettingsProps {
    settings: PDFSettings['chat'];
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (updates: Partial<PDFSettings['chat']>) => void;
}

export const ChatSettings = ({ settings, isExpanded, onToggle, onUpdate }: ChatSettingsProps) => {
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
                <CollapsibleTrigger asChild>
                    <CardHeader className="px-4 cursor-pointer mb-[-3px]">
                        <CardTitle className="flex items-center justify-between font-semibold">
                            Chat Style
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </CardTitle>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="p-4">
                        <div className='space-y-4'>
                            <ColorInput
                                label="User Bubble"
                                value={settings.userBubbleColor}
                                onChange={(value) => onUpdate({ userBubbleColor: value })}
                            />
                            <ColorInput
                                label="User Text"
                                value={settings.userTextColor}
                                onChange={(value) => onUpdate({ userTextColor: value })}
                            />
                            <ColorInput
                                label="AI Bubble"
                                value={settings.aiBubbleColor}
                                onChange={(value) => onUpdate({ aiBubbleColor: value })}
                            />
                            <ColorInput
                                label="AI Text"
                                value={settings.aiTextColor}
                                onChange={(value) => onUpdate({ aiTextColor: value })}
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
                                    max={24}
                                    step={1}
                                />
                            </div>

                            <div>
                                <div className='flex items-center justify-between mb-2'>
                                    <Label className='text-sm font-medium text-foreground/70'>Border Radius</Label>
                                    <span className='text-sm font-semibold text-amber-600'>{settings.bubbleRadius}</span>
                                </div>
                                <Slider
                                    value={[settings.bubbleRadius]}
                                    onValueChange={(values) => onUpdate({ bubbleRadius: values[0] })}
                                    min={0}
                                    max={30}
                                    step={1}
                                />
                            </div>

                            <div>
                                <div className='flex items-center justify-between mb-2'>
                                    <Label className='text-sm font-medium text-foreground/70'>Message Spacing</Label>
                                    <span className='text-sm font-semibold text-amber-600'>{settings.spacing}</span>
                                </div>
                                <Slider
                                    value={[settings.spacing]}
                                    onValueChange={(values) => onUpdate({ spacing: values[0] })}
                                    min={4}
                                    max={32}
                                    step={1}
                                />
                            </div>

                            <div>
                                <Label className='block text-sm font-medium text-foreground/70 mb-2'>Bubble Style</Label>
                                <Select
                                    value={settings.bubbleStyle}
                                    onValueChange={(value) => onUpdate({ bubbleStyle: value as any })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="filled">Filled</SelectItem>
                                        <SelectItem value="outlined">Outlined</SelectItem>
                                        <SelectItem value="minimal">Minimal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex items-center justify-between'>
                                <Label className='text-sm font-medium text-foreground/70'>Show Avatars</Label>
                                <Switch
                                    checked={settings.showAvatars}
                                    onCheckedChange={(checked) => onUpdate({ showAvatars: checked })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};