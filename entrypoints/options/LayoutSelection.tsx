import { useTranslation } from 'react-i18next';
import { PDFSettings } from './types';

interface LayoutSelectorProps {
    selectedLayout: PDFSettings['layout'];
    onLayoutChange: (layout: PDFSettings['layout']) => void;
}

export const LayoutSelector = ({ selectedLayout, onLayoutChange }: LayoutSelectorProps) => {
    const { t } = useTranslation();
    const layouts: Array<{ value: PDFSettings['layout']; image: string; alt: string }> = [
        { value: 'chat', image: '/side/chat2.png', alt: t('settings.layout.chat') },
        { value: 'qa', image: '/side/qna2.png', alt: t('settings.layout.qa') },
        { value: 'document', image: '/side/doc2.png', alt: t('settings.layout.document') },
    ];

    return (
        <div>
            <h2 className='text-sm mb-1 font-semibold'>{t('settings.layout.title')}</h2>
            <div className='flex items-center gap-2'>
                {layouts.map(({ value, image, alt }) => (
                    <div
                        key={value}
                        onClick={() => onLayoutChange(value)}
                        className={`w-full rounded-lg ${selectedLayout === value
                            ? 'bg-primary/20 border-2 border-primary'
                            : 'bg-card shadow-md'
                            } hover:bg-primary/15 border border-border cursor-pointer`}
                    >
                        <img
                            src={image}
                            className='flex-1 rounded-lg drop-shadow-2xl drop-shadow-white'
                            alt={alt}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};