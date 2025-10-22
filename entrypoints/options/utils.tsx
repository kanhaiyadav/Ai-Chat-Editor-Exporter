export const getThemeStyles = (theme: 'light' | 'dark' | 'sepia') => {
    const themes = {
        light: { bg: 'var(--color-card)', text: '#000000' },
        dark: { bg: '#1a1a1a', text: '#ffffff' },
        sepia: { bg: '#f4ecd8', text: '#5c4a3a' },
    };
    return themes[theme];
};

export const cleanHTML = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    doc.querySelectorAll("button").forEach(el => el.remove());
    return doc.body.innerHTML;
};
