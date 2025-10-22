export default defineContentScript({
    matches: [
        "https://chatgpt.com/c/*",
        "https://chat.openai.com/c/*",
        "https://chatgpt.com/g/*",
        "https://chat.openai.com/g/*",
    ],
    main() {
        // Function to insert the button
        function insertExportButton() {
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

                                        // Try to find iframe with document URL when clicking the attachment
                                        // Since we can't simulate clicks, we'll look for any iframe in the document
                                        // that might have been opened, or extract from data attributes if available

                                        // For now, we'll store the attachment info without direct URL
                                        // since the URL is only revealed in the iframe when clicked
                                        attachments.push({
                                            name: fileName,
                                            url: "", // URL not directly accessible without click
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
                            } else if (isAssistant) {
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
            }
        }

        // Initial insertion attempt
        const initialInterval = setInterval(() => {
            const headerDiv = document.querySelector(
                "#conversation-header-actions"
            );
            if (headerDiv) {
                clearInterval(initialInterval);
                insertExportButton();
            }
        }, 500);

        // Set up MutationObserver to watch for DOM changes
        const observer = new MutationObserver((mutations) => {
            // Check if button needs to be re-inserted
            insertExportButton();
        });

        // Start observing the document body for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        console.log("MutationObserver set up to watch for navigation changes");
    },
});
