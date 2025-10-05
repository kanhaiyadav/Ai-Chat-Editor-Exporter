import { PDFSettings } from './types';

interface LayoutSelectorProps {
    selectedLayout: PDFSettings['layout'];
    onLayoutChange: (layout: PDFSettings['layout']) => void;
}

export const LayoutSelector = ({ selectedLayout, onLayoutChange }: LayoutSelectorProps) => {
    const layouts: Array<{ value: PDFSettings['layout']; image: string; alt: string }> = [
        { value: 'chat', image: '/side/chat2.png', alt: 'Chat Layout' },
        { value: 'qa', image: '/side/qna2.png', alt: 'Q&A Layout' },
        { value: 'document', image: '/side/doc2.png', alt: 'Document Layout' },
    ];

    return (
        <div>
            <h2 className='!text-base !my-0 !mb-1'>Select Layout</h2>
            <div className='flex items-center gap-2'>
                {layouts.map(({ value, image, alt }) => (
                    <div
                        key={value}
                        onClick={() => onLayoutChange(value)}
                        className={`w-full rounded-lg ${selectedLayout === value
                                ? 'bg-primary/20 border-2 border-primary'
                                : 'bg-card shadow-md'
                            } hover:bg-primary/15 border cursor-pointer`}
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