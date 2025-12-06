export const getThemeStyles = (theme: 'light' | 'dark' | 'sepia') => {
    const themes = {
        light: { bg: 'var(--color-card)', text: '#000000' },
        dark: { bg: '#1a1a1a', text: '#ffffff' },
        sepia: { bg: '#f4ecd8', text: '#5c4a3a' },
    };
    return themes[theme];
};

export const decodeHTMLEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
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
    }

    if (source !== "chatgpt") {
        doc.querySelectorAll("table").forEach(table => {
            // Check if table already has _tableWrapper
            if (table.parentElement?.classList.contains("_tableWrapper")) {
                return;
            }
            const wrapper = doc.createElement("div");
            wrapper.className = "_tableWrapper";

            // Insert wrapper before the table and move the table inside it
            table.parentNode?.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    }


    if (source === "gemini") {
        // Remove empty attachment containers
        const attachments = doc.querySelectorAll("div.attachment-container");
        attachments.forEach(attachment => {
            // Check if the element has any meaningful text content
            // or any visible child elements (img, video, etc.)
            const hasText = attachment.textContent?.trim().length > 0;
            const hasMedia = attachment.querySelector('img, video, audio, iframe, canvas');

            if (!hasText && !hasMedia) {
                attachment.remove();
            }
        });
    }

    if (source === "deepseek") {
        // Handle DeepSeek-specific code blocks
        doc.querySelectorAll("pre").forEach(pre => {
            pre.querySelectorAll("style").forEach(style => style.remove());
        });
    }

    return doc.body.innerHTML;
};

