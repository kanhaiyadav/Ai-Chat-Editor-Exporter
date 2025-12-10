import { Sun, Moon, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../lib/useTheme';
import type { Theme } from '../lib/themeStorage';

export function ThemeToggle() {
    const { t } = useTranslation();
    const { theme, setTheme } = useTheme();

    const themes: Array<{ value: Theme; icon: any; label: string }> = [
        { value: 'light', icon: Sun, label: t('theme.light') },
        { value: 'dark', icon: Moon, label: t('theme.dark') },
        { value: 'system', icon: Monitor, label: t('theme.system') },
    ];

    return (
        <div className="flex items-center gap-1 bg-black/80 rounded-lg p-1 border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
            {themes.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`p-2 rounded-md transition-all ${theme === value
                        ? 'bg-primary shadow-md text-primary-foreground'
                        : ' dark:text-gray-300 hover:bg-white/10'
                        }`}
                    title={label}
                >
                    <Icon size={18} />
                </button>
            ))}
        </div>
    );
}