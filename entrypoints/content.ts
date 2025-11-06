export default defineContentScript({
    matches: [
        "https://chatgpt.com/*",
        "https://chat.openai.com/*",
        "https://claude.ai/*",
    ],
    main() {
        let currentUrl = location.href;
        let buttonCheckInterval: number | null = null;
        let artifactExportData: {
            [key: string]: {
                content: string;
                type: string;
                title: string;
                subtitle: string;
                artifactIndex: number;
            };
        } = {};
        let lastActiveArtifactIndex: number = -1;

        // Detect which platform we're on - MUST BE BEFORE extractChatId
        const isChatGPT =
            location.hostname.includes("chatgpt.com") ||
            location.hostname.includes("openai.com");
        const isClaude = location.hostname.includes("claude.ai");

        // Initialize currentChatId AFTER isChatGPT and isClaude are defined
        let currentChatId = extractChatId(location.href);

        // Function to extract chat ID from URL
        function extractChatId(url: string): string {
            if (isChatGPT) {
                const match = url.match(/\/c\/([^/?#]+)/);
                return match ? match[1] : "";
            } else if (isClaude) {
                const match = url.match(/\/chat\/([^/?#]+)/);
                return match ? match[1] : "";
            }
            return "";
        }

        // Function to check if we're on a chat page
        function isOnChatPage() {
            if (isChatGPT) {
                return (
                    location.href.includes("/c/") ||
                    location.href.includes("/g/")
                );
            } else if (isClaude) {
                return location.href.includes("/chat/");
            }
            return false;
        }

        // Function to get current active artifact
        function getActiveArtifact(): {
            title: string;
            subtitle: string;
            index: number;
        } {
            const artifacts = Array.from(
                document.querySelectorAll(
                    "div.artifact-block-cell.group\\/artifact-block"
                )
            )
                .map((el) =>
                    el.closest("div.flex.text-left.font-ui.rounded-lg")
                )
                .filter(Boolean);

            const artifactIndex = artifacts.findIndex((div) =>
                div?.classList.contains("border-accent-secondary-200")
            );
            const activeArtifact = artifacts[artifactIndex];
            const title =
                activeArtifact
                    ?.querySelector(".text-sm.line-clamp-1")
                    ?.textContent?.trim() || "";
            const subtitle =
                activeArtifact
                    ?.querySelector(".text-xs.line-clamp-1")
                    ?.textContent?.trim() || "";
            return {
                title,
                subtitle,
                index: artifactIndex,
            };
        }

        // Function to update artifact button state
        function updateArtifactButtonState() {
            const exportButton = document.querySelector(
                "#artifact-export-button"
            ) as HTMLButtonElement;

            if (!exportButton) return;

            const activeArtifact = getActiveArtifact();

            // Update button state based on whether current artifact is included
            const isIncluded = artifactExportData.hasOwnProperty(
                `${activeArtifact.index}`
            );

            if (isIncluded) {
                exportButton.dataset.included = "true";
                exportButton.dataset.artifactId = `${activeArtifact.index}`;
                exportButton.innerHTML = `<span class="text-sm">Exclude from Export</span>`;
            } else {
                exportButton.dataset.included = "false";
                delete exportButton.dataset.artifactId;
                exportButton.innerHTML = `<span class="text-sm">Include in Export</span>`;
            }
        }

        // Function to insert the button for ChatGPT
        function insertChatGPTButton() {
            const headerDiv = document.querySelector(
                "#conversation-header-actions"
            );

            if (headerDiv && !document.querySelector("#export-chat-button")) {
                const exportButton = document.createElement("button");
                exportButton.id = "export-chat-button";
                exportButton.className =
                    "btn relative btn-ghost text-token-text-primary mx-2";
                exportButton.setAttribute("aria-label", "Export Chat");

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

                headerDiv.prepend(exportButton);
                exportButton.addEventListener("click", extractChatGPTData);

                console.log("✅ Export Chat button inserted for ChatGPT");

                if (buttonCheckInterval) {
                    clearInterval(buttonCheckInterval);
                    buttonCheckInterval = null;
                }
            }
        }

        // Function to insert the button for Claude
        function insertClaudeButton() {
            const buttonContainer = document.querySelector(
                "header"
            );
            buttonContainer?.style.setProperty("align-items", "center");
            buttonContainer?.style.setProperty("padding-right", "10px");
            
            if (
                !buttonContainer ||
                document.querySelector("#export-chat-button")
            ) {
                return;
            }

            const exportButton = document.createElement("button");
            exportButton.id = "export-chat-button";
            exportButton.className = `inline-flex
  items-center
  justify-center
  relative
  shrink-0
  can-focus
  select-none
  disabled:pointer-events-none
  disabled:opacity-50
  disabled:shadow-none
  disabled:drop-shadow-none font-base-bold
          border-0.5
          relative
          overflow-hidden
          transition
          duration-100
          backface-hidden h-8 rounded-md px-3 min-w-[4rem] active:scale-[0.985] whitespace-nowrap !text-xs Button_secondary__x7x_y `;
            exportButton.setAttribute("aria-label", "Export Chat");
            exportButton.style.cssText = "margin-left: -5px;";

            exportButton.innerHTML = `Export Chat`;

            buttonContainer.appendChild(exportButton);
            exportButton.addEventListener("click", extractClaudeData);

            console.log("✅ Export Chat button inserted for Claude");

            if (buttonCheckInterval) {
                clearInterval(buttonCheckInterval);
                buttonCheckInterval = null;
            }
        }

        // Function to insert artifact export button in Claude's artifact panel
        function insertArtifactExportButton() {
            // Look for the artifact actions container (where Copy/Publish buttons are)
            const artifactActionsContainer = document.querySelector(
                ".flex.gap-2.items-center.text-sm"
            );
            if (
                !artifactActionsContainer ||
                document.querySelector("#artifact-export-button")
            ) {
                return;
            }

            // Create the export toggle button
            const exportButton = document.createElement("button");
            exportButton.id = "artifact-export-button";
            exportButton.className = `inline-flex
  items-center
  justify-center
  relative
  shrink-0
  can-focus
  select-none
  disabled:pointer-events-none
  disabled:opacity-50
  disabled:shadow-none
  disabled:drop-shadow-none font-base-bold
          border-0.5
          relative
          overflow-hidden
          transition
          duration-100
          backface-hidden h-8 rounded-md px-3 min-w-[4rem] active:scale-[0.985] whitespace-nowrap !text-xs Button_secondary__x7x_y`;
            exportButton.style.cssText = "margin-left: 8px;";

            exportButton.innerHTML = `
                <span class="text-sm">Include in Export</span>
            `;

            // Insert before the Publish button
            const publishButton =
                artifactActionsContainer.querySelector("button");
            if (publishButton) {
                artifactActionsContainer.insertBefore(
                    exportButton,
                    publishButton
                );
            } else {
                artifactActionsContainer.appendChild(exportButton);
            }

            // Add click handler
            exportButton.addEventListener("click", () => {
                handleArtifactExport(exportButton);
            });

            // Set initial button state based on current artifact
            updateArtifactButtonState();

            console.log("✅ Artifact export button inserted");
        }

        // Function to handle artifact export toggle
        function handleArtifactExport(button: HTMLButtonElement) {
            const activeArtifact = getActiveArtifact();

            if (activeArtifact.index === -1) {
                console.warn("No active artifact found");
                return;
            }

            const isIncluded = artifactExportData.hasOwnProperty(
                `${activeArtifact.index}`
            );

            if (isIncluded) {
                // Remove from export
                delete artifactExportData[activeArtifact.index];
                button.dataset.included = "false";
                delete button.dataset.artifactId;
                button.innerHTML = `<span class="text-sm">Include in Export</span>`;
                console.log(
                    `Artifact ${activeArtifact.index} removed from export`
                );
            } else {
                // Add to export
                const artifactData = extractCurrentArtifactData(
                    activeArtifact.index
                );
                if (artifactData) {
                    artifactExportData[activeArtifact.index] = {
                        ...artifactData,
                        title: activeArtifact.title,
                        subtitle: activeArtifact.subtitle,
                    };
                    button.dataset.included = "true";
                    button.dataset.artifactId = `${activeArtifact.index}`;
                    button.innerHTML = `<span class="text-sm">Exclude from Export</span>`;
                    console.log(
                        `Artifact ${activeArtifact.index} added to export:`,
                        artifactExportData[activeArtifact.index]
                    );
                }
            }
        }

        // Function to extract current artifact data
        function extractCurrentArtifactData(activeArtifactIndex: number): {
            content: string;
            type: string;
            artifactIndex: number;
        } | null {
            try {
                const artifactContainer = document.querySelector(
                    ".top-0.right-0.bottom-0.left-0.z-20"
                );

                if (!artifactContainer) {
                    return null;
                }

                // Get artifact content from the code block
                const codeBlock = artifactContainer.querySelector(
                    ".w-full.h-full.relative"
                );
                const content = codeBlock?.innerHTML || "";

                // Determine artifact type from language class
                let artifactType = "text";
                if (codeBlock) {
                    const languageClass = Array.from(codeBlock.classList).find(
                        (cls) => cls.startsWith("language-")
                    );
                    if (languageClass) {
                        artifactType = languageClass.replace("language-", "");
                    }
                }

                return {
                    content: content,
                    type: artifactType,
                    artifactIndex: activeArtifactIndex,
                };
            } catch (error) {
                console.error("Error extracting artifact data:", error);
                return null;
            }
        }

        // Function to extract ChatGPT chat data
        function extractChatGPTData() {
            console.log("Extracting ChatGPT chat data...");

            try {
                let title = "";
                const activeLink = document.querySelector(
                    'nav[aria-label="Chat history"] a[data-active]'
                );
                if (activeLink) {
                    title = activeLink.textContent?.trim() || "";
                }

                const turns = document.querySelectorAll(
                    '[data-testid^="conversation-turn"]'
                );
                const messages: {
                    role: string;
                    content: string;
                    images?: string[];
                    attachments?: { name: string; url: string; type: string }[];
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

                        const uploadedImages = turn.querySelectorAll(
                            'img[alt="Uploaded image"]'
                        );
                        uploadedImages.forEach((img) => {
                            const src = (img as HTMLImageElement).src;
                            if (src && !images.includes(src)) {
                                images.push(src);
                            }
                        });

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
                                    nameEl.textContent?.trim() || "Unknown";
                                const fileType =
                                    typeEl?.textContent?.trim() || "File";

                                attachments.push({
                                    name: fileName,
                                    url: "",
                                    type: fileType,
                                });
                            }
                        });

                        const fileContainers = turn.querySelectorAll(
                            '[class*="file"], [class*="document"]'
                        );
                        fileContainers.forEach((container) => {
                            const svgParent = container.querySelector("svg");
                            if (svgParent) {
                                const parent = container.closest("a");
                                if (parent && parent.hasAttribute("href")) {
                                    const href = parent.getAttribute("href");
                                    if (href) {
                                        const nameEl = container.querySelector(
                                            ".truncate.font-semibold"
                                        );
                                        const typeEl = container.querySelector(
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
                        content = assistantContent?.innerHTML?.trim() || "";

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
                        } = { role, content };

                        if (images.length > 0) message.images = images;
                        if (attachments.length > 0)
                            message.attachments = attachments;

                        messages.push(message);
                    }
                });

                const iframes = document.querySelectorAll(
                    'iframe[src*="backend-api/estuary/content"]'
                );
                iframes.forEach((iframe) => {
                    const src = (iframe as HTMLIFrameElement).src;
                    const title = (iframe as HTMLIFrameElement).title;

                    if (title && src) {
                        const lastUserMessage = messages
                            .filter((m) => m.role === "user")
                            .pop();
                        if (lastUserMessage && lastUserMessage.attachments) {
                            const attachment = lastUserMessage.attachments.find(
                                (a) => a.name === title
                            );
                            if (attachment && !attachment.url) {
                                attachment.url = src;
                            }
                        }
                    }
                });

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
                        chrome.runtime.sendMessage({ action: "openOptions" });
                        console.log("ChatGPT chat data saved:", messages);
                    }
                );
            } catch (error) {
                console.error("Error extracting ChatGPT chat data:", error);
                alert("Error extracting chat data. Please try again.");
            }
        }

        // Function to extract Claude chat data
        function extractClaudeData() {
            console.log("Extracting Claude chat data...");

            try {
                let title = "";
                const titleElement = document.querySelector(
                    '[data-testid="chat-title-button"]'
                );
                if (titleElement) {
                    title = titleElement.textContent?.trim() || "Claude Chat";
                }

                const messageContainers = document.querySelectorAll(
                    '[data-testid="user-message"], .font-claude-response'
                );

                const messageArray = Array.from(messageContainers);
                if (messageArray.length > 0) {
                    messageArray.pop();
                }

                const messages: {
                    role: string;
                    content: string;
                    images?: string[];
                    attachments?: {
                        name: string;
                        url: string;
                        type: string;
                        preview?: string;
                    }[];
                    artifacts?: {
                        content: string;
                        type: string;
                        artifactIndex: number;
                    }[];
                }[] = [];

                messageArray.forEach((container, idx) => {
                    let role = "unknown";
                    let content = "";
                    let images: string[] = [];
                    let attachments: {
                        name: string;
                        url: string;
                        type: string;
                        preview?: string;
                    }[] = [];

                    if (
                        container.hasAttribute("data-testid") &&
                        container.getAttribute("data-testid") === "user-message"
                    ) {
                        role = "user";

                        const textElements = container.querySelectorAll("p");
                        const textParts: string[] = [];
                        textElements.forEach((p) => {
                            const text = p.textContent?.trim();
                            if (text) textParts.push(text);
                        });
                        content = textParts.join("\n\n");

                        const parentBubble = container.closest(".bg-bg-300");

                        if (parentBubble) {
                            const outerContainer = parentBubble.parentElement;

                            if (outerContainer) {
                                const fileThumbnailContainer =
                                    outerContainer.querySelector(
                                        ".gap-2.mx-0\\.5.mb-3.flex.flex-wrap"
                                    );

                                if (fileThumbnailContainer) {
                                    const fileThumbnails =
                                        fileThumbnailContainer.querySelectorAll(
                                            '[data-testid="file-thumbnail"]'
                                        );

                                    fileThumbnails.forEach((thumb) => {
                                        const fileTypeEl =
                                            thumb.querySelector(".uppercase");

                                        const previewEl =
                                            thumb.querySelector(
                                                "p.text-\\[8px\\]"
                                            );
                                        const previewText =
                                            previewEl?.textContent?.trim() ||
                                            "";

                                        const fileType =
                                            fileTypeEl?.textContent?.trim() ||
                                            "File";

                                        const fileName =
                                            fileType.toLowerCase() === "pasted"
                                                ? "Pasted Text"
                                                : "Unknown File";

                                        attachments.push({
                                            name: fileName,
                                            url: "",
                                            type: fileType,
                                            preview: previewText,
                                        });
                                    });
                                }

                                const uploadedImages =
                                    outerContainer.querySelectorAll("img");

                                uploadedImages.forEach((img) => {
                                    const src = (img as HTMLImageElement).src;
                                    if (src && !images.includes(src)) {
                                        images.push(src);
                                    }
                                });
                            }
                        }

                        const message: {
                            role: string;
                            content: string;
                            images?: string[];
                            attachments?: {
                                name: string;
                                url: string;
                                type: string;
                                preview?: string;
                            }[];
                        } = {
                            role,
                            content: content || "",
                        };

                        if (images.length > 0) message.images = images;
                        if (attachments.length > 0)
                            message.attachments = attachments;

                        messages.push(message);
                    } else {
                        role = "assistant";

                        const contentArea = container;
                        if (contentArea) {
                            content = contentArea.innerHTML?.trim() || "";
                        }

                        const generatedImages =
                            container.querySelectorAll("img");
                        generatedImages.forEach((img) => {
                            const src = (img as HTMLImageElement).src;
                            if (
                                src &&
                                !images.includes(src) &&
                                !src.includes("data:image")
                            ) {
                                images.push(src);
                            }
                        });

                        if (content || images.length > 0) {
                            const message: {
                                role: string;
                                content: string;
                                images?: string[];
                                artifacts?: {
                                    content: string;
                                    type: string;
                                    title: string;
                                    subtitle: string;
                                    artifactIndex: number;
                                }[];
                            } = { role, content };

                            if (images.length > 0) message.images = images;

                            // Check if this message has associated artifacts
                            const messageArtifacts =
                                Object.values(artifactExportData);

                            if (messageArtifacts.length > 0) {
                                message.artifacts = messageArtifacts.map(
                                    (artifact) => ({
                                        content: artifact.content,
                                        type: artifact.type,
                                        title: artifact.title,
                                        subtitle: artifact.subtitle,
                                        artifactIndex: artifact.artifactIndex,
                                    })
                                );
                            }

                            messages.push(message);
                        }
                    }
                });

                chrome.storage.local.set(
                    {
                        chatData: {
                            title,
                            messages,
                            source: "claude",
                            artifacts: Object.values(artifactExportData),
                        },
                        savedChatId: null,
                        pdfSettings: null,
                    },
                    () => {
                        chrome.runtime.sendMessage({ action: "openOptions" });
                        console.log("Claude chat data saved:", messages);
                        console.log("Artifacts included:", artifactExportData);
                    }
                );
            } catch (error) {
                console.error("Error extracting Claude chat data:", error);
                alert("Error extracting chat data. Please try again.");
            }
        }

        // Function to insert the appropriate button
        function insertExportButton() {
            if (!isOnChatPage()) {
                console.log("Not on a chat page, skipping button insertion");
                return;
            }

            if (isChatGPT) {
                insertChatGPTButton();
            } else if (isClaude) {
                insertClaudeButton();
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

                const newChatId = extractChatId(location.href);

                // Check if we've switched to a different chat
                if (newChatId !== currentChatId) {
                    console.log(
                        `Chat changed from ${currentChatId} to ${newChatId} - clearing artifact data`
                    );
                    // Clear artifact export data when switching chats
                    artifactExportData = {};
                    lastActiveArtifactIndex = -1;
                    currentChatId = newChatId;
                }

                currentUrl = location.href;

                const existingButton = document.querySelector(
                    "#export-chat-button"
                );
                if (existingButton && !isOnChatPage()) {
                    existingButton.remove();
                    console.log("Removed button - not on chat page");
                }

                if (isOnChatPage()) {
                    console.log(
                        "Navigated to chat page, waiting for header..."
                    );
                    if (buttonCheckInterval) {
                        clearInterval(buttonCheckInterval);
                    }
                    buttonCheckInterval = window.setInterval(() => {
                        insertExportButton();
                    }, 300);

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

            if (
                isOnChatPage() &&
                !document.querySelector("#export-chat-button")
            ) {
                insertExportButton();
            }

            // For Claude: also check for artifact panel
            if (isClaude && isOnChatPage()) {
                const currentActiveArtifact = getActiveArtifact();

                // Check if artifact has changed
                if (currentActiveArtifact.index !== lastActiveArtifactIndex) {
                    lastActiveArtifactIndex = currentActiveArtifact.index;
                    // Update button state when switching artifacts
                    updateArtifactButtonState();
                }

                if (!document.querySelector("#artifact-export-button")) {
                    insertArtifactExportButton();
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // Periodic URL check as fallback
        setInterval(checkUrlChange, 1000);

        console.log("✅ Content script initialized - watching for chat pages");
    },
});
