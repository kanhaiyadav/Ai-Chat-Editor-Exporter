export default defineBackground(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "openOptions") {
            const optionsUrl = chrome.runtime.getURL("/options.html");
            chrome.tabs.create({ url: optionsUrl });
        }
    });
});
