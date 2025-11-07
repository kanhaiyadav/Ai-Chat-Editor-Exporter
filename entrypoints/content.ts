export default defineContentScript({
    matches: [
        "https://chatgpt.com/*",
        "https://chat.openai.com/*",
        "https://claude.ai/*",
        "https://gemini.google.com/*",
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
        let monacoExtractorReady = false;
        let monacoExtractorLoading = false;

        // Detect which platform we're on - MUST BE BEFORE extractChatId
        const isChatGPT =
            location.hostname.includes("chatgpt.com") ||
            location.hostname.includes("openai.com");
        const isClaude = location.hostname.includes("claude.ai");
        const isGemini = location.hostname.includes("gemini.google.com");

        // Initialize currentChatId AFTER isChatGPT, isClaude, and isGemini are defined
        let currentChatId = extractChatId(location.href);

        // Load Monaco extractor script once for Gemini
        if (isGemini) {
            loadMonacoExtractor();
        }

        // Function to load Monaco extractor script once
        function loadMonacoExtractor() {
            if (monacoExtractorLoading || monacoExtractorReady) {
                return;
            }

            monacoExtractorLoading = true;
            console.log("🔧 Loading Monaco extractor script...");

            const script = document.createElement("script");
            script.src = chrome.runtime.getURL("monaco-extractor.js");
            script.id = "monaco-extractor-script";

            // Listen for ready signal
            const readyHandler = () => {
                monacoExtractorReady = true;
                monacoExtractorLoading = false;
                console.log("✅ Monaco extractor ready");
            };

            window.addEventListener("monaco-extractor-ready", readyHandler, {
                once: true,
            });

            // Fallback timeout
            setTimeout(() => {
                if (!monacoExtractorReady) {
                    monacoExtractorReady = true;
                    monacoExtractorLoading = false;
                    console.log("⚠️ Monaco extractor ready (timeout fallback)");
                }
            }, 1000);

            (document.head || document.documentElement).appendChild(script);
            console.log("📦 Monaco extractor script injected");
        }

        // Function to extract chat ID from URL
        function extractChatId(url: string): string {
            if (isChatGPT) {
                const match = url.match(/\/c\/([^/?#]+)/);
                return match ? match[1] : "";
            } else if (isClaude) {
                const match = url.match(/\/chat\/([^/?#]+)/);
                return match ? match[1] : "";
            } else if (isGemini) {
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
            } else if (isGemini) {
                return location.href.includes("/app");
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
            const buttonContainer = document.querySelector("header");
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

        // Function to insert the button for Gemini
        function insertGeminiButton() {
            const buttonContainer = document.querySelector(
                ".right-section .buttons-container"
            );

            console.log(
                "Chat2Pdf: ❤️❤️❤️ Inserting Gemini button...",
                buttonContainer
            );

            if (
                !buttonContainer ||
                document.querySelector("#export-chat-button")
            ) {
                return;
            }

            const exportButton = document.createElement("button");
            exportButton.id = "export-chat-button";
            exportButton.className = `mdc-button mat-mdc-button-base mat-mdc-menu-trigger mat-mdc-tooltip-trigger icon-button mat-mdc-button mat-unthemed`;
            exportButton.setAttribute("aria-label", "Export Chat");
            exportButton.setAttribute("mat-ripple-loader-uninitialized", "");
            exportButton.setAttribute(
                "mat-ripple-loader-class-name",
                "mat-mdc-button-ripple"
            );
            exportButton.style.cssText = "margin-right: 8px;";

            exportButton.innerHTML = `
                <span class="mat-mdc-button-persistent-ripple mdc-button__ripple"></span>
                <mat-icon role="img" fonticon="file_upload" class="mat-icon notranslate google-symbols mat-ligature-font mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font" data-mat-icon-name="share"></mat-icon>
                <span class="mdc-button__label">Export Chat</span>
                <span class="mat-focus-indicator"></span>
                <span class="mat-mdc-button-touch-target"></span>
            `;

            buttonContainer.appendChild(exportButton);
            exportButton.addEventListener("click", extractGeminiData);

            console.log("✅ Export Chat button inserted for Gemini");

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

        // Function to get current active Gemini artifact
        function getActiveGeminiArtifact(): {
            title: string;
            index: number;
        } {
            const artifactPanel = document.querySelector(
                "code-immersive-panel"
            );

            if (!artifactPanel) {
                return { title: "", index: -1 };
            }

            const titleElement = artifactPanel.querySelector(
                "toolbar .title-text"
            );
            const title = titleElement?.textContent?.trim() || "";

            // Get artifact index from the panel's data or position
            const allArtifacts = document.querySelectorAll(
                "code-immersive-panel"
            );
            const artifactIndex = Array.from(allArtifacts).indexOf(
                artifactPanel as Element
            );

            return {
                title,
                index: artifactIndex,
            };
        }

        // Function to insert artifact export button in Gemini's artifact panel
        function insertGeminiArtifactExportButton() {
            // Look for the toolbar action buttons container
            const toolbar = document.querySelector(
                "toolbar[data-test-id='toolbar'] .action-buttons"
            );

            if (
                !toolbar ||
                document.querySelector("#gemini-artifact-export-button")
            ) {
                return;
            }

            // Create the export toggle button
            const exportButton = document.createElement("button");
            exportButton.id = "gemini-artifact-export-button";
            exportButton.className = `mdc-button mat-mdc-button-base mat-mdc-button mat-unthemed`;
            exportButton.setAttribute("mat-button", "");
            exportButton.setAttribute("color", "primary");
            exportButton.setAttribute("data-test-id", "artifact-export-button");
            exportButton.setAttribute("mat-ripple-loader-uninitialized", "");
            exportButton.setAttribute(
                "mat-ripple-loader-class-name",
                "mat-mdc-button-ripple"
            );
            exportButton.style.cssText = "margin-right: 8px;";

            exportButton.innerHTML = `
                <span class="mat-mdc-button-persistent-ripple mdc-button__ripple"></span>
                <span class="mdc-button__label">Include in Export</span>
                <span class="mat-focus-indicator"></span>
                <span class="mat-mdc-button-touch-target"></span>
            `;

            // Insert at the beginning of action buttons
            const firstButton = toolbar.querySelector("button");
            if (firstButton) {
                toolbar.insertBefore(exportButton, firstButton);
            } else {
                toolbar.appendChild(exportButton);
            }

            // Add click handler
            exportButton.addEventListener("click", () => {
                handleGeminiArtifactExport(exportButton);
            });

            // Set initial button state based on current artifact
            updateGeminiArtifactButtonState();

            console.log("✅ Gemini artifact export button inserted");
        }

        // Function to update Gemini artifact button state
        function updateGeminiArtifactButtonState() {
            const exportButton = document.querySelector(
                "#gemini-artifact-export-button"
            ) as HTMLButtonElement;

            if (!exportButton) return;

            const activeArtifact = getActiveGeminiArtifact();

            // Update button state based on whether current artifact is included
            const isIncluded = artifactExportData.hasOwnProperty(
                `${activeArtifact.index}`
            );

            const labelSpan = exportButton.querySelector(".mdc-button__label");
            if (!labelSpan) return;

            if (isIncluded) {
                exportButton.dataset.included = "true";
                exportButton.dataset.artifactId = `${activeArtifact.index}`;
                labelSpan.textContent = "Exclude from Export";
            } else {
                exportButton.dataset.included = "false";
                delete exportButton.dataset.artifactId;
                labelSpan.textContent = "Include in Export";
            }
        }

        // Function to handle Gemini artifact export toggle
        function handleGeminiArtifactExport(button: HTMLButtonElement) {
            const activeArtifact = getActiveGeminiArtifact();

            if (activeArtifact.index === -1) {
                console.warn("No active Gemini artifact found");
                return;
            }

            const isIncluded = artifactExportData.hasOwnProperty(
                `${activeArtifact.index}`
            );

            const labelSpan = button.querySelector(".mdc-button__label");
            if (!labelSpan) return;

            if (isIncluded) {
                // Remove from export
                delete artifactExportData[activeArtifact.index];
                button.dataset.included = "false";
                delete button.dataset.artifactId;
                labelSpan.textContent = "Include in Export";
                console.log(
                    `Gemini artifact ${activeArtifact.index} removed from export`
                );
            } else {
                // Add to export
                const artifactData = extractCurrentGeminiArtifactData(
                    activeArtifact.index
                );
                if (artifactData) {
                    artifactExportData[activeArtifact.index] = {
                        ...artifactData,
                        title: activeArtifact.title,
                        subtitle: "",
                    };
                    button.dataset.included = "true";
                    button.dataset.artifactId = `${activeArtifact.index}`;
                    labelSpan.textContent = "Exclude from Export";
                    console.log(
                        `Gemini artifact ${activeArtifact.index} added to export:`,
                        artifactExportData[activeArtifact.index]
                    );
                }
            }
        }

        // Function to extract current Gemini artifact data using web accessible resource
        function extractCurrentGeminiArtifactData(
            activeArtifactIndex: number
        ): {
            content: string;
            type: string;
            artifactIndex: number;
        } | null {
            try {
                const artifactPanel = document.querySelector(
                    "code-immersive-panel"
                );

                if (!artifactPanel) {
                    console.error("❌ No code-immersive-panel found");
                    return null;
                }

                console.log(
                    "🔍 Starting Gemini artifact extraction via web accessible resource..."
                );

                const monacoEditor =
                    artifactPanel.querySelector("xap-code-editor");

                if (!monacoEditor) {
                    console.error("❌ No xap-code-editor found");
                    return null;
                }

                // Ensure Monaco extractor is loaded and ready
                if (!monacoExtractorReady) {
                    console.log(
                        "⏳ Waiting for Monaco extractor to be ready..."
                    );

                    // If not loading yet, load it now
                    if (!monacoExtractorLoading) {
                        loadMonacoExtractor();
                    }

                    // Wait for it to be ready (max 2 seconds)
                    const waitStart = Date.now();
                    while (
                        !monacoExtractorReady &&
                        Date.now() - waitStart < 2000
                    ) {
                        const now = Date.now();
                        while (Date.now() - now < 50) {} // 50ms increments
                    }

                    if (!monacoExtractorReady) {
                        console.error(
                            "❌ Monaco extractor failed to load in time"
                        );
                        alert(
                            "Monaco extractor not ready.\n\nPlease try again in a moment."
                        );
                        return null;
                    }
                }

                console.log(
                    "✅ Monaco extractor is ready, proceeding with extraction"
                );

                let content = "";
                let artifactType = "text";

                // Generate unique event ID for this extraction
                const eventId = `monaco_extract_${Date.now()}_${Math.random()}`;

                // Listen for response from the injected script
                let extracted = false;
                const startTime = Date.now();

                const responseHandler = (event: any) => {
                    const detail = event.detail;

                    if (detail.eventId === eventId && detail.data) {
                        content = detail.data.content;
                        artifactType = detail.data.language;
                        extracted = true;
                        console.log(
                            `✅ Extracted ${content.length} characters, ${detail.data.lineCount} lines, language: ${artifactType}`
                        );
                    } else if (detail.eventId === eventId && !detail.data) {
                        console.error("❌ Monaco extraction returned no data");
                    }
                };

                window.addEventListener(
                    "monaco-data-response",
                    responseHandler
                );

                // Send extraction request
                console.log("📤 Sending extraction request...");
                window.dispatchEvent(
                    new CustomEvent("monaco-data-request", {
                        detail: { eventId },
                    })
                );

                // Wait for response (max 1500ms)
                while (!extracted && Date.now() - startTime < 1500) {
                    const now = Date.now();
                    while (Date.now() - now < 10) {} // 10ms increments
                }

                // Cleanup
                window.removeEventListener(
                    "monaco-data-response",
                    responseHandler
                );

                if (!content) {
                    console.error(
                        "❌ Failed to extract content via web accessible resource"
                    );

                    alert(
                        "Unable to extract code automatically.\n\nPlease:\n1. Click the 'Copy' button in the code editor toolbar\n2. The code will be in your clipboard\n3. Try exporting again"
                    );
                    return null;
                }

                console.log(
                    `✅ EXTRACTION COMPLETE: ${content.length} characters, type: ${artifactType}`
                );

                // Fallback language detection if not detected from Monaco
                let finalType = artifactType;

                // Second try: Get language from data-mode-id attribute
                if (finalType === "text") {
                    const editorContainer = monacoEditor.querySelector(
                        ".xap-monaco-container"
                    );
                    if (editorContainer) {
                        const modeId =
                            editorContainer.getAttribute("data-mode-id");
                        if (modeId) {
                            finalType = modeId;
                            console.log(
                                `  Language from data-mode-id: ${finalType}`
                            );
                        }
                    }
                }

                // Third try: Get language from toolbar title (file extension)
                if (finalType === "text") {
                    console.log("  Trying to detect from filename...");
                    const titleElement = artifactPanel.querySelector(
                        "toolbar .title-text"
                    );
                    const title = titleElement?.textContent?.trim() || "";

                    if (title.includes(".tsx")) {
                        finalType = "tsx";
                    } else if (title.includes(".ts")) {
                        finalType = "typescript";
                    } else if (title.includes(".jsx")) {
                        finalType = "jsx";
                    } else if (title.includes(".js")) {
                        finalType = "javascript";
                    } else if (title.includes(".py")) {
                        finalType = "python";
                    } else if (title.includes(".html")) {
                        finalType = "html";
                    } else if (title.includes(".css")) {
                        finalType = "css";
                    } else if (title.includes(".java")) {
                        finalType = "java";
                    } else if (title.includes(".cpp") || title.includes(".c")) {
                        finalType = "cpp";
                    } else if (title.includes(".json")) {
                        finalType = "json";
                    } else if (title.includes(".xml")) {
                        finalType = "xml";
                    } else if (title.includes(".md")) {
                        finalType = "markdown";
                    }

                    if (finalType !== "text") {
                        console.log(`  Language from filename: ${finalType}`);
                    }
                }

                console.log(`✅ Final detected language: ${finalType}`);

                return {
                    content: content,
                    type: finalType,
                    artifactIndex: activeArtifactIndex,
                };
            } catch (error) {
                console.error("Error extracting Gemini artifact data:", error);
                return null;
            }
        }

        // Function to extract ChatGPT chat data
        function extractChatGPTData() {
            console.log("Extracting ChatGPT chat data...");

            const exportButton = document.querySelector(
                "#export-chat-button"
            ) as HTMLButtonElement;
            const originalButtonHTML = exportButton?.innerHTML;

            // Set loading state
            if (exportButton) {
                exportButton.disabled = true;
                exportButton.style.opacity = "0.6";
                const labelSpan = exportButton.querySelector("span");
                if (labelSpan) {
                    labelSpan.textContent = "Exporting...";
                }
            }

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

                        // Restore button state
                        if (exportButton && originalButtonHTML) {
                            exportButton.disabled = false;
                            exportButton.style.opacity = "";
                            exportButton.innerHTML = originalButtonHTML;
                        }
                    }
                );
            } catch (error) {
                console.error("Error extracting ChatGPT chat data:", error);
                alert("Error extracting chat data. Please try again.");

                // Restore button state on error
                if (exportButton && originalButtonHTML) {
                    exportButton.disabled = false;
                    exportButton.style.opacity = "";
                    exportButton.innerHTML = originalButtonHTML;
                }
            }
        }

        // Function to extract Claude chat data
        function extractClaudeData() {
            console.log("Extracting Claude chat data...");

            const exportButton = document.querySelector(
                "#export-chat-button"
            ) as HTMLButtonElement;
            const originalButtonHTML = exportButton?.innerHTML;

            // Set loading state
            if (exportButton) {
                exportButton.disabled = true;
                exportButton.style.opacity = "0.6";
                exportButton.textContent = "Exporting...";
            }

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

                        // Restore button state
                        if (exportButton && originalButtonHTML) {
                            exportButton.disabled = false;
                            exportButton.style.opacity = "";
                            exportButton.innerHTML = originalButtonHTML;
                        }
                    }
                );
            } catch (error) {
                console.error("Error extracting Claude chat data:", error);
                alert("Error extracting chat data. Please try again.");

                // Restore button state on error
                if (exportButton && originalButtonHTML) {
                    exportButton.disabled = false;
                    exportButton.style.opacity = "";
                    exportButton.innerHTML = originalButtonHTML;
                }
            }
        }

        // Helper function to convert image URL to data URL using background script
        async function imageUrlToDataUrl(url: string): Promise<string> {
            try {
                return new Promise((resolve, reject) => {
                    chrome.runtime.sendMessage(
                        {
                            action: "fetchImageAsDataUrl",
                            url: url,
                        },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                console.error(
                                    "Chrome runtime error:",
                                    chrome.runtime.lastError
                                );
                                reject(chrome.runtime.lastError);
                                return;
                            }

                            if (response && response.success) {
                                resolve(response.dataUrl);
                            } else {
                                console.error(
                                    "Failed to fetch image:",
                                    response?.error
                                );
                                // Return original URL as fallback
                                resolve(response?.originalUrl || url);
                            }
                        }
                    );
                });
            } catch (error) {
                console.error("Error converting image to data URL:", error);
                return url; // Fallback to original URL
            }
        }

        // Function to extract Gemini chat data
        async function extractGeminiData() {
            console.log("Extracting Gemini chat data...");

            const exportButton = document.querySelector(
                "#export-chat-button"
            ) as HTMLButtonElement;

            // Store original button content
            const originalButtonHTML = exportButton?.innerHTML;

            try {
                // Set loading state
                if (exportButton) {
                    exportButton.disabled = true;
                    exportButton.style.opacity = "0.6";
                    exportButton.style.cursor = "not-allowed";
                    exportButton.innerHTML = `
                        <span class="mat-mdc-button-persistent-ripple mdc-button__ripple"></span>
                        <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 50 50"
  width="24"
  height="24"
  stroke="currentColor"
  fill="none"
  stroke-width="4"
  style="animation: spin 1s linear infinite;"
>
  <circle
    cx="25"
    cy="25"
    r="20"
    stroke-opacity="0.25"
  />
  <path
    d="M45 25a20 20 0 0 1-20 20"
    stroke-opacity="1"
  />
</svg>

<style>
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>

                        <span class="mdc-button__label" style="margin-left: 10px;">Exporting...</span>
                        <span class="mat-focus-indicator"></span>
                        <span class="mat-mdc-button-touch-target"></span>
                    `;

                    // Add spinner animation
                    const style = document.createElement("style");
                    style.id = "gemini-export-spinner";
                    style.textContent = `
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `;
                    if (!document.getElementById("gemini-export-spinner")) {
                        document.head.appendChild(style);
                    }
                }

                let title = "";
                const titleElement = document.querySelector(
                    ".conversation-title"
                );
                if (titleElement) {
                    title = titleElement.textContent?.trim() || "Gemini Chat";
                }

                const conversationContainers = document.querySelectorAll(
                    ".conversation-container"
                );

                const messages: {
                    role: string;
                    content: string;
                    images?: string[];
                    artifacts?: {
                        content: string;
                        type: string;
                        title: string;
                        artifactIndex: number;
                    }[];
                }[] = [];

                // First pass: collect all messages with image URLs
                conversationContainers.forEach((container, idx) => {
                    // Extract user message
                    const userQuery = container.querySelector("user-query");
                    if (userQuery) {
                        let userContent = "";
                        const queryTextLines =
                            userQuery.querySelectorAll(".query-text-line");
                        const textParts: string[] = [];
                        queryTextLines.forEach((line) => {
                            const text = line.textContent?.trim();
                            if (text) textParts.push(text);
                        });
                        userContent = textParts.join("\n");

                        // Extract user-uploaded images
                        const userImages: string[] = [];
                        const userImageElements =
                            userQuery.querySelectorAll("img");
                        userImageElements.forEach((img) => {
                            const src = (img as HTMLImageElement).src;
                            // Exclude file type icons specifically (not actual image previews)
                            // File icons have class "new-file-icon" or come from drive icon CDN
                            const isFileTypeIcon =
                                img.classList.contains("new-file-icon") ||
                                src.includes(
                                    "drive-thirdparty.googleusercontent.com/32/type/"
                                );

                            if (
                                src &&
                                !userImages.includes(src) &&
                                !isFileTypeIcon
                            ) {
                                userImages.push(src);
                            }
                        });

                        // Extract user attachments (files like PDFs, docs, etc.)
                        const attachments: {
                            name: string;
                            url: string;
                            type: string;
                        }[] = [];

                        const filePreviewContainers =
                            userQuery.querySelectorAll(
                                "user-query-file-preview"
                            );
                        filePreviewContainers.forEach((previewContainer) => {
                            const fileButton =
                                previewContainer.querySelector(
                                    "button[aria-label]"
                                );
                            if (fileButton) {
                                const fileName =
                                    fileButton.getAttribute("aria-label") || "";
                                const fileNameDiv =
                                    previewContainer.querySelector(
                                        ".new-file-name"
                                    );
                                const fileTypeDiv =
                                    previewContainer.querySelector(
                                        ".new-file-type"
                                    );

                                const name =
                                    fileNameDiv?.textContent?.trim() ||
                                    fileName;
                                const type =
                                    fileTypeDiv?.textContent?.trim() || "File";

                                // Check if this is an image by:
                                // 1. File type text
                                // 2. File extension
                                // 3. Whether the preview container has an img element that's NOT a file icon
                                const hasImagePreview =
                                    previewContainer.querySelector(
                                        "img:not(.new-file-icon)"
                                    ) !== null;
                                const imageExtensions = [
                                    ".jpg",
                                    ".jpeg",
                                    ".png",
                                    ".gif",
                                    ".webp",
                                    ".bmp",
                                    ".svg",
                                    ".ico",
                                ];
                                const hasImageExtension = imageExtensions.some(
                                    (ext) =>
                                        (name + fileName)
                                            .toLowerCase()
                                            .endsWith(ext)
                                );
                                const isImageType =
                                    type.toLowerCase().includes("image") ||
                                    type.toLowerCase().includes("jpg") ||
                                    type.toLowerCase().includes("jpeg") ||
                                    type.toLowerCase().includes("png") ||
                                    type.toLowerCase().includes("gif") ||
                                    type.toLowerCase().includes("webp");

                                const isImageAttachment =
                                    isImageType ||
                                    hasImageExtension ||
                                    hasImagePreview;

                                // Only add as attachment if it's not an image
                                // Images should be handled separately in the images array
                                if (name && !isImageAttachment) {
                                    attachments.push({
                                        name: name,
                                        url: "",
                                        type: type,
                                    });
                                }
                            }
                        });

                        if (
                            userContent ||
                            userImages.length > 0 ||
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
                                role: "user",
                                content: userContent,
                            };

                            if (userImages.length > 0) {
                                message.images = userImages;
                            }

                            if (attachments.length > 0) {
                                message.attachments = attachments;
                            }

                            messages.push(message);
                        }
                    }

                    // Extract assistant message
                    const modelResponse =
                        container.querySelector("model-response");
                    if (modelResponse) {
                        const messageContent = modelResponse.querySelector(
                            "message-content .markdown"
                        );
                        const content = messageContent?.innerHTML?.trim() || "";
                        const images: string[] = [];

                        const imageElements = modelResponse.querySelectorAll(
                            "generated-image img"
                        );
                        imageElements.forEach((img) => {
                            const src = (img as HTMLImageElement).src;
                            if (src && !images.includes(src)) {
                                images.push(src);
                            }
                        });

                        if (content) {
                            const message: {
                                role: string;
                                content: string;
                                images?: string[];
                                artifacts?: {
                                    content: string;
                                    type: string;
                                    title: string;
                                    artifactIndex: number;
                                }[];
                            } = {
                                role: "assistant",
                                content: content,
                                images: images,
                            };

                            messages.push(message);
                        }
                    }
                });

                // Second pass: convert all image URLs to data URLs
                console.log("Converting Gemini images to data URLs...");
                for (const message of messages) {
                    if (message.images && message.images.length > 0) {
                        const dataUrlPromises = message.images.map((url) =>
                            imageUrlToDataUrl(url)
                        );
                        message.images = await Promise.all(dataUrlPromises);
                    }
                }
                console.log("Image conversion complete!");

                chrome.storage.local.set(
                    {
                        chatData: {
                            title,
                            messages,
                            source: "gemini",
                            artifacts: Object.values(artifactExportData),
                        },
                        savedChatId: null,
                        pdfSettings: null,
                    },
                    () => {
                        chrome.runtime.sendMessage({ action: "openOptions" });
                        console.log("Gemini chat data saved:", messages);
                        console.log("Artifacts included:", artifactExportData);

                        // Restore button state after successful export
                        if (exportButton && originalButtonHTML) {
                            exportButton.disabled = false;
                            exportButton.style.opacity = "";
                            exportButton.style.cursor = "";
                            exportButton.innerHTML = originalButtonHTML;
                        }
                    }
                );
            } catch (error) {
                console.error("Error extracting Gemini chat data:", error);
                alert("Error extracting chat data. Please try again.");

                // Restore button state on error
                if (exportButton && originalButtonHTML) {
                    exportButton.disabled = false;
                    exportButton.style.opacity = "";
                    exportButton.style.cursor = "";
                    exportButton.innerHTML = originalButtonHTML;
                }
            }
        }

        // Function to insert the appropriate button
        function insertExportButton() {
            if (!isOnChatPage()) {
                console.log("Not on a chat page, skipping button insertion");
                return;
            }
            console.log(
                "Chat2Pdf: ❤️❤️❤️ Inserting export button...",
                isChatGPT,
                isClaude,
                isGemini
            );
            if (isChatGPT) {
                insertChatGPTButton();
            } else if (isClaude) {
                insertClaudeButton();
            } else if (isGemini) {
                insertGeminiButton();
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

                console.log(
                    "Chat2Pdf: ❤️❤️❤️ URL change detected",
                    isOnChatPage()
                );

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

            console.log("Chat2Pdf: ❤️❤️❤️ URL change detected", isOnChatPage());

            if (
                isOnChatPage() &&
                !document.querySelector("#export-chat-button")
            ) {
                console.log(
                    "Chat2Pdf: ❤️❤️❤️ Inserting export button...",
                    isChatGPT,
                    isClaude,
                    isGemini
                );
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

            // For Gemini: also check for artifact (code) panel
            if (isGemini && isOnChatPage()) {
                const currentActiveGeminiArtifact = getActiveGeminiArtifact();

                // Check if artifact has changed
                if (
                    currentActiveGeminiArtifact.index !==
                    lastActiveArtifactIndex
                ) {
                    lastActiveArtifactIndex = currentActiveGeminiArtifact.index;
                    // Update button state when switching artifacts
                    updateGeminiArtifactButtonState();
                }

                if (!document.querySelector("#gemini-artifact-export-button")) {
                    insertGeminiArtifactExportButton();
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
