export default defineContentScript({
    matches: ["https://chatgpt.com/*", "https://chat.openai.com/*"],
    main() {
        let currentUrl = location.href;
        let buttonCheckInterval: number | null = null;

        // Function to check if we're on a chat page
        function isOnChatPage() {
            return (
                location.href.includes("/c/") || location.href.includes("/g/")
            );
        }

        // Function to insert the button
        function insertExportButton() {
            // Only insert button if we're on a chat page
            if (!isOnChatPage()) {
                console.log("Not on a chat page, skipping button insertion");
                return;
            }

            const headerDiv = document.querySelector(
                "#conversation-header-actions"
            );

            // Check if header exists and button doesn't already exist
            if (headerDiv && !document.querySelector("#export-chat-button")) {
                // Create the Export Chat button
                const exportButton = document.createElement("button");
                exportButton.id = "export-chat-button";
                exportButton.className =
                    "btn relative btn-ghost text-token-text-primary mx-2";
                exportButton.setAttribute("aria-label", "Export Chat");

                // Add icon + text
                exportButton.innerHTML = `
                    <div class="flex w-full items-center justify-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" stroke-width="2"
                             stroke-linecap="round" stroke-linejoin="round"
                             class="w-4 h-4">
                            <path d="M13 11L21.2 2.8" />
                            <path d="M22 6.8V2H17.2" />
                            <path d="M11 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V13" />
                        </svg>
                        <span>Export Chat</span>
                    </div>
                `;

                // Insert it into the header
                headerDiv.prepend(exportButton);

                // Add the click event listener
                exportButton.addEventListener("click", () => {
                    console.log("Extracting chat data...");

                    try {
                        let title = "";
                        const activeLink = document.querySelector(
                            'nav[aria-label="Chat history"] a[data-active]'
                        );
                        if (activeLink) {
                            title = activeLink.textContent?.trim() || "";
                        }

                        // Find all conversation turns
                        const turns = document.querySelectorAll(
                            '[data-testid^="conversation-turn"]'
                        );
                        const messages: {
                            role: string;
                            content: string;
                            images?: string[];
                            attachments?: {
                                name: string;
                                url: string;
                                type: string;
                            }[];
                        }[] = [];

                        turns.forEach((turn) => {
                            const isUser = turn.querySelector(
                                '[data-message-author-role="user"]'
                            );
                            const isAssistant = turn.querySelector(
                                '[data-message-author-role="assistant"]'
                            );

                            let role = "unknown";
                            let content = "";
                            let images: string[] = [];
                            let attachments: {
                                name: string;
                                url: string;
                                type: string;
                            }[] = [];

                            if (isUser) {
                                role = "user";
                                const userBubble = turn.querySelector(
                                    ".user-message-bubble-color, [data-multiline]"
                                );
                                content = userBubble?.textContent?.trim() || "";

                                // Extract user-uploaded images
                                const uploadedImages = turn.querySelectorAll(
                                    'img[alt="Uploaded image"]'
                                );
                                uploadedImages.forEach((img) => {
                                    const src = (img as HTMLImageElement).src;
                                    if (src && !images.includes(src)) {
                                        images.push(src);
                                    }
                                });

                                // Extract PDF and other document attachments
                                const attachmentLinks = turn.querySelectorAll(
                                    'a[target="_blank"][rel="noreferrer"]'
                                );
                                attachmentLinks.forEach((link) => {
                                    const nameEl = link.querySelector(
                                        ".truncate.font-semibold"
                                    );
                                    const typeEl = link.querySelector(
                                        ".text-token-text-secondary.truncate"
                                    );

                                    if (nameEl) {
                                        const fileName =
                                            nameEl.textContent?.trim() ||
                                            "Unknown";
                                        const fileType =
                                            typeEl?.textContent?.trim() ||
                                            "File";

                                        attachments.push({
                                            name: fileName,
                                            url: "",
                                            type: fileType,
                                        });
                                    }
                                });

                                // Alternative: Try to extract file info from nearby elements
                                const fileContainers = turn.querySelectorAll(
                                    '[class*="file"], [class*="document"]'
                                );
                                fileContainers.forEach((container) => {
                                    const svgParent =
                                        container.querySelector("svg");
                                    if (svgParent) {
                                        const parent = container.closest("a");
                                        if (
                                            parent &&
                                            parent.hasAttribute("href")
                                        ) {
                                            const href =
                                                parent.getAttribute("href");
                                            if (href) {
                                                const nameEl =
                                                    container.querySelector(
                                                        ".truncate.font-semibold"
                                                    );
                                                const typeEl =
                                                    container.querySelector(
                                                        ".text-token-text-secondary.truncate"
                                                    );

                                                if (
                                                    nameEl &&
                                                    !attachments.some(
                                                        (a) =>
                                                            a.name ===
                                                            nameEl.textContent?.trim()
                                                    )
                                                ) {
                                                    attachments.push({
                                                        name:
                                                            nameEl.textContent?.trim() ||
                                                            "Unknown",
                                                        url: href,
                                                        type:
                                                            typeEl?.textContent?.trim() ||
                                                            "File",
                                                    });
                                                }
                                            }
                                        }
                                    }
                                });
                            } else {
                                role = "assistant";
                                const assistantContent = turn.querySelector(
                                    '[data-message-author-role="assistant"]'
                                );

                                // Extract text content
                                content =
                                    assistantContent?.innerHTML?.trim() || "";

                                // Extract images from assistant messages (generated images)
                                const imageElements = turn.querySelectorAll(
                                    'img[alt="Generated image"]'
                                );
                                imageElements.forEach((img) => {
                                    const src = (img as HTMLImageElement).src;
                                    if (src && !images.includes(src)) {
                                        images.push(src);
                                    }
                                });
                            }

                            if (
                                content ||
                                images.length > 0 ||
                                attachments.length > 0
                            ) {
                                const message: {
                                    role: string;
                                    content: string;
                                    images?: string[];
                                    attachments?: {
                                        name: string;
                                        url: string;
                                        type: string;
                                    }[];
                                } = {
                                    role,
                                    content,
                                };

                                if (images.length > 0) {
                                    message.images = images;
                                }

                                if (attachments.length > 0) {
                                    message.attachments = attachments;
                                }

                                messages.push(message);
                            }
                        });

                        // Also check for any open iframes with PDF/document content
                        const iframes = document.querySelectorAll(
                            'iframe[src*="backend-api/estuary/content"]'
                        );
                        iframes.forEach((iframe) => {
                            const src = (iframe as HTMLIFrameElement).src;
                            const title = (iframe as HTMLIFrameElement).title;

                            // Try to find corresponding message and add URL
                            if (title && src) {
                                const lastUserMessage = messages
                                    .filter((m) => m.role === "user")
                                    .pop();
                                if (
                                    lastUserMessage &&
                                    lastUserMessage.attachments
                                ) {
                                    const attachment =
                                        lastUserMessage.attachments.find(
                                            (a) => a.name === title
                                        );
                                    if (attachment && !attachment.url) {
                                        attachment.url = src;
                                    }
                                }
                            }
                        });

                        // Save to Chrome storage and open options page
                        chrome.storage.local.set(
                            {
                                chatData: {
                                    title,
                                    messages,
                                    source: "chatgpt",
                                },
                                savedChatId: null,
                                pdfSettings: null,
                            },
                            () => {
                                chrome.runtime.sendMessage({
                                    action: "openOptions",
                                });
                                console.log("Chat data saved:", messages);
                            }
                        );
                    } catch (error) {
                        console.error("Error extracting chat data:", error);
                        alert("Error extracting chat data. Please try again.");
                    }
                });

                console.log("✅ Export Chat button inserted successfully");

                // Stop the interval once button is inserted
                if (buttonCheckInterval) {
                    clearInterval(buttonCheckInterval);
                    buttonCheckInterval = null;
                }
            }
        }

        // Function to check for URL changes and handle navigation
        function checkUrlChange() {
            if (location.href !== currentUrl) {
                console.log(
                    "URL changed from",
                    currentUrl,
                    "to",
                    location.href
                );
                currentUrl = location.href;

                // Clear any existing button when navigating away from chat page
                const existingButton = document.querySelector(
                    "#export-chat-button"
                );
                if (existingButton && !isOnChatPage()) {
                    existingButton.remove();
                    console.log("Removed button - not on chat page");
                }

                // If navigating to a chat page, start looking for the header
                if (isOnChatPage()) {
                    console.log(
                        "Navigated to chat page, waiting for header..."
                    );
                    // Start checking for the header element
                    if (buttonCheckInterval) {
                        clearInterval(buttonCheckInterval);
                    }
                    buttonCheckInterval = window.setInterval(() => {
                        insertExportButton();
                    }, 300);

                    // Stop checking after 15 seconds
                    setTimeout(() => {
                        if (buttonCheckInterval) {
                            clearInterval(buttonCheckInterval);
                            buttonCheckInterval = null;
                        }
                    }, 15000);
                }
            }
        }

        // Initial insertion attempt if already on a chat page
        if (isOnChatPage()) {
            console.log("Already on chat page, starting button insertion...");
            buttonCheckInterval = window.setInterval(() => {
                insertExportButton();
            }, 300);

            // Stop checking after 15 seconds
            setTimeout(() => {
                if (buttonCheckInterval) {
                    clearInterval(buttonCheckInterval);
                    buttonCheckInterval = null;
                }
            }, 15000);
        }

        // Set up MutationObserver to watch for DOM changes
        const observer = new MutationObserver(() => {
            checkUrlChange();

            // Try to insert button if we're on a chat page and it's missing
            if (
                isOnChatPage() &&
                !document.querySelector("#export-chat-button")
            ) {
                insertExportButton();
            }
        });

        // Start observing the document body for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // Periodic URL check as fallback
        setInterval(checkUrlChange, 1000);

        console.log("✅ Content script initialized - watching for chat pages");
    },
});
