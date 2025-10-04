export type Theme = "light" | "dark" | "system";

export const themeStorage = {
    async getValue(): Promise<Theme> {
        return new Promise((resolve) => {
            chrome.storage.local.get(["theme"], (result) => {
                resolve(result.theme || "system");
            });
        });
    },

    async setValue(value: Theme): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.set({ theme: value }, () => {
                resolve();
            });
        });
    },

    watch(callback: (newValue: Theme) => void): () => void {
        const listener = (
            changes: { [key: string]: chrome.storage.StorageChange },
            areaName: string
        ) => {
            if (areaName === "local" && changes.theme) {
                callback(changes.theme.newValue as Theme);
            }
        };

        chrome.storage.onChanged.addListener(listener);

        return () => {
            chrome.storage.onChanged.removeListener(listener);
        };
    },
};

export const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
};

export const getEffectiveTheme = (theme: Theme): "light" | "dark" => {
    if (theme === "system") {
        return getSystemTheme();
    }
    return theme;
};
