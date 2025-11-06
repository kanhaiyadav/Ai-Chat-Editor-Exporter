export const getThemeStyles = (theme: 'light' | 'dark' | 'sepia') => {
    const themes = {
        light: { bg: 'var(--color-card)', text: '#000000' },
        dark: { bg: '#1a1a1a', text: '#ffffff' },
        sepia: { bg: '#f4ecd8', text: '#5c4a3a' },
    };
    return themes[theme];
};

export const cleanHTML = (html: string, source: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // 1. Remove all buttons
    doc.querySelectorAll("button").forEach(el => el.remove());

    if (source === "claude") {
        // 2. Handle Claude-specific code blocks
        doc.querySelectorAll("div.relative.group\\/copy").forEach(wrapper => {
            const header = wrapper.querySelector("div.text-text-500");
            const hasCodeBlock = wrapper.querySelector("pre");

            if (header && hasCodeBlock) {
                wrapper.classList.add("claude-code");
                header.classList.add("claude-code-header");
            }
        });

        // 3. Wrap all tables in a div._tableWrapper
        doc.querySelectorAll("table").forEach(table => {
            const wrapper = doc.createElement("div");
            wrapper.className = "_tableWrapper";

            // Insert wrapper before the table and move the table inside it
            table.parentNode?.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    }

    return doc.body.innerHTML;
};

