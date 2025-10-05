import html2pdf from 'html2pdf.js';
import { PDFSettings } from './types';

export const getThemeStyles = (theme: 'light' | 'dark' | 'sepia') => {
    const themes = {
        light: { bg: 'var(--color-card)', text: '#000000' },
        dark: { bg: '#1a1a1a', text: '#ffffff' },
        sepia: { bg: '#f4ecd8', text: '#5c4a3a' },
    };
    return themes[theme];
};

export const generatePDF = (settings: PDFSettings) => {
    const container = document.getElementById('chat-container');
    console.log("generating pdf...");

    if (container) {
        const options = {
            margin: settings.general.margins,
            filename: `chat-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
            },
            jsPDF: {
                unit: 'mm' as const,
                format: settings.general.pageSize,
                orientation: 'portrait' as const
            }
        };
        html2pdf().set(options).from(container).save();
    }
};