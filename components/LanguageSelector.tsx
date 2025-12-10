import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Language {
    code: string;
    name: string;
    nativeName: string;
}

const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
];

export function LanguageSelector() {
    const { i18n } = useTranslation();

    const changeLanguage = (languageCode: string) => {
        i18n.changeLanguage(languageCode);
        localStorage.setItem('app-language', languageCode);
    };

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/80 border border-gray-200 dark:border-gray-700 backdrop-blur-sm text-white hover:bg-black/90 transition-all h-11"
                    title="Select Language"
                >
                    <Globe size={18} />
                    <span className="text-sm font-medium hidden sm:inline">{currentLanguage.nativeName}</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 max-h-[400px] overflow-y-auto">
                {languages.map((language) => (
                    <DropdownMenuItem
                        key={language.code}
                        onClick={() => changeLanguage(language.code)}
                        className={`cursor-pointer ${i18n.language === language.code
                            ? 'bg-primary text-primary-foreground'
                            : ''
                            }`}
                    >
                        <span className="font-medium">{language.nativeName}</span>
                        {i18n.language === language.code && (
                            <span className="ml-auto">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
