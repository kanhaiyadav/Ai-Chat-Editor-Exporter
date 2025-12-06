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

export const exportToWord = () => {
    // Get the preview container content
    const previewContent = document.getElementById('chat-container');
    if (!previewContent) {
        console.error('Preview content not found');
        return;
    }

    // Clone the content to avoid modifying the original
    const clonedContent = previewContent.cloneNode(true) as HTMLElement;

    // Get computed styles from the original container
    const originalStyles = window.getComputedStyle(previewContent);

    // Create a complete HTML document with styles
    const htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset='utf-8'>
    <title>Chat Export</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        /* Base styles */
        body {
            font-family: ${originalStyles.fontFamily};
            background-color: ${originalStyles.backgroundColor};
            color: ${originalStyles.color};
            padding: 20px;
            line-height: 1.6;
        }
        
        /* Preserve code block styling */
        pre {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 12px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.4;
            margin: 12px 0;
        }
        
        code {
            font-family: 'Courier New', monospace;
            background-color: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.9em;
        }
        
        pre code {
            background-color: transparent;
            padding: 0;
        }
        
        /* Table styling */
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 12px 0;
        }
        
        table, th, td {
            border: 1px solid #ddd;
        }
        
        th, td {
            padding: 8px 12px;
            text-align: left;
        }
        
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        
        /* Headings */
        h1, h2, h3, h4, h5, h6 {
            margin-top: 16px;
            margin-bottom: 8px;
            font-weight: 600;
        }
        
        /* Lists */
        ul, ol {
            margin: 8px 0;
            padding-left: 24px;
        }
        
        li {
            margin: 4px 0;
        }
        
        /* Links */
        a {
            color: #0066cc;
            text-decoration: underline;
        }
        
        /* Blockquotes */
        blockquote {
            border-left: 4px solid #ddd;
            margin: 12px 0;
            padding-left: 16px;
            color: #666;
        }
        
        /* Message container styling */
        .message-block {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        
        /* Preserve spacing */
        p {
            margin: 8px 0;
        }
        
        /* Images */
        img {
            max-width: 100%;
            height: auto;
        }
        
        /* Preserve basic layout */
        div {
            margin: 0;
        }
    </style>
</head>
<body>
    ${clonedContent.innerHTML}
</body>
</html>`;

    // Create a Blob with the HTML content
    const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword'
    });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `chat-export-${timestamp}.doc`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportToMarkdown = () => {
    const previewContent = document.getElementById('chat-container');
    if (!previewContent) {
        console.error('Preview content not found');
        return;
    }

    // Clone the content
    const clonedContent = previewContent.cloneNode(true) as HTMLElement;

    // Convert HTML to Markdown
    let markdown = htmlToMarkdown(clonedContent);

    // Create a Blob with the markdown content
    const blob = new Blob([markdown], {
        type: 'text/markdown;charset=utf-8'
    });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `chat-export-${timestamp}.md`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportToPlainText = () => {
    const previewContent = document.getElementById('chat-container');
    if (!previewContent) {
        console.error('Preview content not found');
        return;
    }

    // Clone and extract text content
    const clonedContent = previewContent.cloneNode(true) as HTMLElement;

    // Get text with some formatting preserved
    let text = htmlToPlainText(clonedContent);

    // Create a Blob with the text content
    const blob = new Blob([text], {
        type: 'text/plain;charset=utf-8'
    });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `chat-export-${timestamp}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportToHTML = () => {
    const previewContent = document.getElementById('chat-container');
    if (!previewContent) {
        console.error('Preview content not found');
        return;
    }

    // Clone the content
    const clonedContent = previewContent.cloneNode(true) as HTMLElement;
    const originalStyles = window.getComputedStyle(previewContent);

    // Create a standalone HTML document
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Export</title>
    <style>
        body {
            font-family: ${originalStyles.fontFamily};
            background-color: ${originalStyles.backgroundColor};
            color: ${originalStyles.color};
            padding: 20px;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
        }
        
        pre {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 12px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.4;
            margin: 12px 0;
        }
        
        code {
            font-family: 'Courier New', monospace;
            background-color: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.9em;
        }
        
        pre code {
            background-color: transparent;
            padding: 0;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 12px 0;
        }
        
        table, th, td {
            border: 1px solid #ddd;
        }
        
        th, td {
            padding: 8px 12px;
            text-align: left;
        }
        
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        
        h1, h2, h3, h4, h5, h6 {
            margin-top: 16px;
            margin-bottom: 8px;
            font-weight: 600;
        }
        
        ul, ol {
            margin: 8px 0;
            padding-left: 24px;
        }
        
        li {
            margin: 4px 0;
        }
        
        a {
            color: #0066cc;
            text-decoration: underline;
        }
        
        blockquote {
            border-left: 4px solid #ddd;
            margin: 12px 0;
            padding-left: 16px;
            color: #666;
        }
        
        img {
            max-width: 100%;
            height: auto;
        }
        
        .message-block {
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    ${clonedContent.innerHTML}
</body>
</html>`;

    // Create a Blob with the HTML content
    const blob = new Blob([htmlContent], {
        type: 'text/html;charset=utf-8'
    });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `chat-export-${timestamp}.html`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Helper function to convert HTML to Markdown
function htmlToMarkdown(element: HTMLElement): string {
    let markdown = '';

    function processNode(node: Node, indent: string = ''): string {
        let result = '';

        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim() || '';
            return text ? text + ' ' : '';
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tagName = el.tagName.toLowerCase();

            switch (tagName) {
                case 'h1':
                    result += '\n# ' + el.textContent?.trim() + '\n\n';
                    break;
                case 'h2':
                    result += '\n## ' + el.textContent?.trim() + '\n\n';
                    break;
                case 'h3':
                    result += '\n### ' + el.textContent?.trim() + '\n\n';
                    break;
                case 'h4':
                    result += '\n#### ' + el.textContent?.trim() + '\n\n';
                    break;
                case 'h5':
                    result += '\n##### ' + el.textContent?.trim() + '\n\n';
                    break;
                case 'h6':
                    result += '\n###### ' + el.textContent?.trim() + '\n\n';
                    break;
                case 'p':
                    result += processChildren(el, indent) + '\n\n';
                    break;
                case 'br':
                    result += '\n';
                    break;
                case 'strong':
                case 'b':
                    result += '**' + el.textContent?.trim() + '**';
                    break;
                case 'em':
                case 'i':
                    result += '*' + el.textContent?.trim() + '*';
                    break;
                case 'code':
                    if (el.parentElement?.tagName.toLowerCase() !== 'pre') {
                        result += '`' + el.textContent + '`';
                    } else {
                        result += el.textContent;
                    }
                    break;
                case 'pre':
                    const code = el.querySelector('code');
                    const codeText = code ? code.textContent : el.textContent;
                    result += '\n```\n' + codeText + '\n```\n\n';
                    break;
                case 'a':
                    const href = el.getAttribute('href') || '';
                    result += '[' + el.textContent?.trim() + '](' + href + ')';
                    break;
                case 'ul':
                    result += '\n' + processListItems(el, indent, '-') + '\n';
                    break;
                case 'ol':
                    result += '\n' + processListItems(el, indent, '1.') + '\n';
                    break;
                case 'blockquote':
                    const lines = el.textContent?.trim().split('\n') || [];
                    result += '\n' + lines.map(line => '> ' + line).join('\n') + '\n\n';
                    break;
                case 'hr':
                    result += '\n---\n\n';
                    break;
                case 'table':
                    result += '\n' + processTable(el) + '\n';
                    break;
                case 'img':
                    const src = el.getAttribute('src') || '';
                    const alt = el.getAttribute('alt') || 'image';
                    result += '![' + alt + '](' + src + ')';
                    break;
                default:
                    result += processChildren(el, indent);
                    break;
            }
        }

        return result;
    }

    function processChildren(element: HTMLElement, indent: string = ''): string {
        let result = '';
        element.childNodes.forEach(child => {
            result += processNode(child, indent);
        });
        return result;
    }

    function processListItems(ul: HTMLElement, indent: string, marker: string): string {
        let result = '';
        const items = ul.querySelectorAll(':scope > li');
        items.forEach((li, index) => {
            const itemMarker = marker === '1.' ? `${index + 1}.` : marker;
            result += indent + itemMarker + ' ' + (li.textContent?.trim() || '') + '\n';
        });
        return result;
    }

    function processTable(table: HTMLElement): string {
        let result = '';
        const rows = Array.from(table.querySelectorAll('tr'));

        rows.forEach((row, rowIndex) => {
            const cells = Array.from(row.querySelectorAll('th, td'));
            result += '| ' + cells.map(cell => cell.textContent?.trim() || '').join(' | ') + ' |\n';

            // Add separator after header row
            if (rowIndex === 0) {
                result += '| ' + cells.map(() => '---').join(' | ') + ' |\n';
            }
        });

        return result;
    }

    markdown = processNode(element);

    // Clean up extra whitespace
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

    return markdown;
}

// Helper function to convert HTML to plain text
function htmlToPlainText(element: HTMLElement): string {
    let text = '';

    function processNode(node: Node, indent: string = ''): string {
        let result = '';

        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent || '';
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tagName = el.tagName.toLowerCase();

            switch (tagName) {
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                    result += '\n' + el.textContent?.trim() + '\n' + '='.repeat(el.textContent?.trim().length || 0) + '\n\n';
                    break;
                case 'p':
                    result += processChildren(el, indent) + '\n\n';
                    break;
                case 'br':
                    result += '\n';
                    break;
                case 'pre':
                case 'code':
                    result += '\n' + el.textContent + '\n';
                    break;
                case 'ul':
                case 'ol':
                    const items = el.querySelectorAll(':scope > li');
                    items.forEach((li, index) => {
                        result += indent + '• ' + (li.textContent?.trim() || '') + '\n';
                    });
                    result += '\n';
                    break;
                case 'blockquote':
                    result += '\n' + (el.textContent?.trim() || '') + '\n\n';
                    break;
                case 'hr':
                    result += '\n' + '-'.repeat(50) + '\n\n';
                    break;
                case 'table':
                    const rows = el.querySelectorAll('tr');
                    rows.forEach(row => {
                        const cells = Array.from(row.querySelectorAll('th, td'));
                        result += cells.map(cell => cell.textContent?.trim() || '').join(' | ') + '\n';
                    });
                    result += '\n';
                    break;
                default:
                    result += processChildren(el, indent);
                    break;
            }
        }

        return result;
    }

    function processChildren(element: HTMLElement, indent: string = ''): string {
        let result = '';
        element.childNodes.forEach(child => {
            result += processNode(child, indent);
        });
        return result;
    }

    text = processNode(element);

    // Clean up extra whitespace
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    return text;
}



