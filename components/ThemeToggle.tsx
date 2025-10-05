import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../lib/useTheme';
import type { Theme } from '../lib/themeStorage';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const themes: Array<{ value: Theme; icon: any; label: string }> = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div className="flex items-center gap-1 bg-black/80 rounded-lg p-1 border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
            {themes.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`p-2 rounded-md transition-all ${theme === value
                        ? 'bg-primary shadow-md text-primary-foreground'
                        : 'text-white/80 hover:text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    title={label}
                >
                    <Icon size={18} />
                </button>
            ))}
        </div>
    );
}