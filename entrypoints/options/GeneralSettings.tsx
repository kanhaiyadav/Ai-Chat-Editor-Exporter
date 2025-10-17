import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PDFSettings } from './types';

interface GeneralSettingsProps {
    ChatTheme: 'light' | 'dark';
    setChatTheme: (theme: 'light' | 'dark') => void;
    settings: PDFSettings['general'];
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (updates: Partial<PDFSettings['general']>) => void;
}

export const GeneralSettings = ({ ChatTheme, setChatTheme, settings, isExpanded, onToggle, onUpdate }: GeneralSettingsProps) => {
    return (
        <Card className="shadow-sm border border-gray-200">
            <Collapsible open={isExpanded} onOpenChange={onToggle}>
                <CollapsibleTrigger asChild>
                    <CardHeader className="px-4 cursor-pointer mb-[-3px]">
                        <CardTitle className="flex items-center justify-between font-semibold">
                            General Settings
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </CardTitle>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="p-4">
                        <div className='space-y-4'>

                            <div className='flex items-center justify-between'>
                                <Label className='text-sm font-medium text-foreground/70'>Include Header</Label>
                                <Switch
                                    checked={settings.includeHeader}
                                    onCheckedChange={(checked) => onUpdate({ includeHeader: checked })}
                                />
                            </div>

                            {settings.includeHeader && (
                                <div>
                                    <Label className='block text-sm font-medium text-foreground/70 mb-2'>Header Text</Label>
                                    <Input
                                        type="text"
                                        value={settings.headerText}
                                        onChange={(e) => onUpdate({ headerText: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};