import { useState, useEffect } from "react";
import {
    themeStorage,
    getEffectiveTheme,
    getSystemTheme,
    type Theme,
} from "./themeStorage";

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>("system");
    const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(
        "light"
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load initial theme
        themeStorage.getValue().then((value: Theme) => {
            setThemeState(value);
            const effective: "light" | "dark" = getEffectiveTheme(value);
            setEffectiveTheme(effective);
            updateDocumentClass(effective);
            setLoading(false);
        });

        // Watch for theme changes in storage
        const unwatch: () => void = themeStorage.watch((newValue: Theme) => {
            setThemeState(newValue);
            const effective: "light" | "dark" = getEffectiveTheme(newValue);
            setEffectiveTheme(effective);
            updateDocumentClass(effective);
        });

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemThemeChange = () => {
            themeStorage.getValue().then((currentTheme: Theme) => {
                if (currentTheme === "system") {
                    const effective: "light" | "dark" = getSystemTheme();
                    setEffectiveTheme(effective);
                    updateDocumentClass(effective);
                }
            });
        };

        mediaQuery.addEventListener("change", handleSystemThemeChange);

        return () => {
            unwatch();
            mediaQuery.removeEventListener("change", handleSystemThemeChange);
        };
    }, []);

    const setTheme = async (newTheme: Theme) => {
        await themeStorage.setValue(newTheme);
    };

    return { theme, effectiveTheme, setTheme, loading };
}

function updateDocumentClass(theme: "light" | "dark") {
    const root = document.documentElement;
    if (theme === "dark") {
        root.classList.add("dark");
    } else {
        root.classList.remove("dark");
    }
}
