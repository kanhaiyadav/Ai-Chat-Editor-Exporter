import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PDFSettings } from './types';
import { RiBrushAiLine } from "react-icons/ri";

interface QASettingsProps {
    settings: PDFSettings['qa'];
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (updates: Partial<PDFSettings['qa']>) => void;
}

export const QASettings = ({ settings, isExpanded, onToggle, onUpdate }: QASettingsProps) => {
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
                    <CardHeader className="px-4 transition-colors cursor-pointer">
                        <CardTitle className="flex items-center justify-between font-semibold">
                            <span className="flex items-center gap-2">
                                <RiBrushAiLine size={20} />
                                {t('settings.qaStyle.title')}
                            </span>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </CardTitle>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="p-4">
                        <div className='space-y-4'>
                            <ColorInput
                                label={t('settings.qaStyle.question')}
                                value={settings.questionColor}
                                onChange={(value) => onUpdate({ questionColor: value })}
                            />
                            <ColorInput
                                label={t('settings.qaStyle.answer')}
                                value={settings.answerColor}
                                onChange={(value) => onUpdate({ answerColor: value })}
                            />

                            <div>
                                <Label className='block text-sm font-medium text-foreground/70 mb-2'>{t('settings.qaStyle.questionPrefix')}</Label>
                                <Input
                                    type="text"
                                    value={settings.questionPrefix}
                                    onChange={(e) => onUpdate({ questionPrefix: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label className='block text-sm font-medium text-foreground/70 mb-2'>{t('settings.qaStyle.answerPrefix')}</Label>
                                <Input
                                    type="text"
                                    value={settings.answerPrefix}
                                    onChange={(e) => onUpdate({ answerPrefix: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label className='block text-sm font-medium text-foreground/70 mb-2'>{t('settings.qaStyle.separatorStyle')}</Label>
                                <Select
                                    value={settings.separatorStyle}
                                    onValueChange={(value) => onUpdate({ separatorStyle: value as any })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="line">{t('settings.qaStyle.line')}</SelectItem>
                                        <SelectItem value="dots">{t('settings.qaStyle.dots')}</SelectItem>
                                        <SelectItem value="none">{t('settings.qaStyle.none')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex items-center justify-between'>
                                <Label className='text-sm font-medium text-foreground/70'>{t('settings.qaStyle.numberQuestions')}</Label>
                                <Switch
                                    checked={settings.numbering}
                                    onCheckedChange={(checked) => onUpdate({ numbering: checked })}
                                />
                            </div>

                            <div className='flex items-center justify-between'>
                                <Label className='text-sm font-medium text-foreground/70'>{t('settings.qaStyle.indentAnswers')}</Label>
                                <Switch
                                    checked={settings.indentAnswer}
                                    onCheckedChange={(checked) => onUpdate({ indentAnswer: checked })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};