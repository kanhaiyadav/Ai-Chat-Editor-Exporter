export default defineBackground(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "openOptions") {
            const optionsUrl = chrome.runtime.getURL("/options.html");
            chrome.tabs.create({ url: optionsUrl });
        } else if (message.action === "fetchImageAsDataUrl") {
            // Handle image fetching in background to bypass CORS
            fetchImageAsDataUrl(message.url)
                .then((dataUrl) => sendResponse({ success: true, dataUrl }))
                .catch((error) =>
                    sendResponse({
                        success: false,
                        error: error.message,
                        originalUrl: message.url,
                    })
                );
            return true; // Keep message channel open for async response
        }
    });

    async function fetchImageAsDataUrl(url: string): Promise<string> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error fetching image:", error);
            throw error;
        }
    }
});
