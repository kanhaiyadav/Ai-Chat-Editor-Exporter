export default defineContentScript({
    matches: [
        "https://chatgpt.com/*",
        "https://chat.openai.com/*",
        "https://claude.ai/*",
        "https://gemini.google.com/*",
        "https://chat.deepseek.com/*",
    ],
    main() {
        let currentUrl = location.href;
        let buttonCheckInterval: number | null = null;
        let monacoExtractorReady = false;
        let monacoExtractorLoading = false;

        // Detect which platform we're on - MUST BE BEFORE extractChatId
        const isChatGPT =
            location.hostname.includes("chatgpt.com") ||
            location.hostname.includes("openai.com");
        const isClaude = location.hostname.includes("claude.ai");
        const isGemini = location.hostname.includes("gemini.google.com");
        const isDeepSeek = location.hostname.includes("deepseek.com");

        // Initialize currentChatId AFTER isChatGPT, isClaude, and isGemini are defined
        let currentChatId = extractChatId(location.href);

        // Load Monaco extractor script once for Gemini
        if (isGemini) {
            loadMonacoExtractor();
        }

        // Helper function to escape HTML special characters
        function escapeHtml(text: string): string {
            const div = document.createElement("div");
            div.textContent = text;
            return div.innerHTML;
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
                /* Lines 79-81 omitted */
            } else if (isClaude) {
                /* Lines 82-84 omitted */
            } else if (isGemini) {
                /* Lines 85-87 omitted */
            } else if (isDeepSeek) {
                const match = url.match(/\/chat\/s\/([^/?]+)/);
                return match ? match[1] : "";
            }
            return "";
        }

        // Function to check if we're on a chat page
        function isOnChatPage() {
            if (isChatGPT) {
                return (
                    location.href.includes("/c/") ||
                    location.href.includes("/g/") ||
                    location.href.includes("temporary-chat")
                );
            } else if (isClaude) {
                return location.href.includes("/chat/");
            } else if (isGemini) {
                return location.href.includes("/app");
            } else if (isDeepSeek) {
                return location.href.includes("/chat/");
            }
            return false;
        } // Function to get current active artifact
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
                        <span>ExportMyChat</span>
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
          backface-hidden h-8 rounded-md px-3 min-w-[4rem] active:scale-[0.985] whitespace-nowrap !text-xs Button_secondary__Teecd `;
            exportButton.setAttribute("aria-label", "Export Chat");
            exportButton.style.cssText = "margin-left: -5px;";

            exportButton.innerHTML = `ExportMyChat`;

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
                "ExportMyChat: ❤️❤️❤️ Inserting Gemini button...",
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
            exportButton.className = `mdc-button mat-mdc-button-base mat-mdc-button mat-unthemed`;
            exportButton.setAttribute("mat-button", "");
            exportButton.setAttribute("color", "primary");
            exportButton.setAttribute("aria-label", "Export Chat");
            exportButton.setAttribute("mat-ripple-loader-uninitialized", "");
            exportButton.setAttribute(
                "mat-ripple-loader-class-name",
                "mat-mdc-button-ripple"
            );
            exportButton.style.cssText = "margin-right: 8px;";

            exportButton.innerHTML = `
                <span class="mat-mdc-button-persistent-ripple mdc-button__ripple"></span>
                <mat-icon role="img" class="mat-icon notranslate google-symbols mat-ligature-font mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font">file_download</mat-icon>
                <span class="mdc-button__label">ExportMyChat</span>
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

        // Function to insert the button for DeepSeek
        function insertDeepSeekButton() {
            const buttonContainer = document.querySelector(
                "._765a5cd"
            ) as HTMLElement;
            buttonContainer?.style.setProperty("position", "relative");

            if (
                !buttonContainer ||
                document.querySelector("#export-chat-button")
            ) {
                return;
            }

            const exportButton = document.createElement("button");
            exportButton.id = "export-chat-button";
            exportButton.className = `ds-atom-button ds-text-button ds-text-button--with-icon`;
            exportButton.setAttribute("role", "button");
            exportButton.setAttribute("aria-disabled", "false");
            exportButton.style.cssText =
                "position: absolute; top: 15px; left: 10px; padding: 6px 12px; z-index: 1000; gap: 5px;";

            exportButton.innerHTML = `
                <span class="ds-icon ds-atom-button__icon" style="font-size: 16px; width: 16px; height: 16px; margin-right: 3px;">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                            <path d="M13 11L21.2 2.8"></path>
                            <path d="M22 6.8V2H17.2"></path>
                            <path d="M11 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V13"></path>
                        </svg>
                </span>
                <span class="">ExportMyChat</span>
            `;

            buttonContainer.prepend(exportButton);
            exportButton.addEventListener("click", extractDeepSeekData);

            console.log("✅ Export Chat button inserted for DeepSeek");

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

            // Create the export button
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
          backface-hidden h-8 rounded-md px-3 min-w-[4rem] active:scale-[0.985] whitespace-nowrap !text-xs Button_secondary__Teecd`;
            exportButton.style.cssText = "margin-left: 8px;";

            exportButton.innerHTML = `
                <span class="text-sm">Export Artifact</span>
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
                handleClaudeArtifactExport();
            });

            console.log("✅ Artifact export button inserted");
        }

        // Function to handle Claude artifact export Artifact
        function handleClaudeArtifactExport() {
            const exportButton = document.querySelector(
                "#artifact-export-button"
            ) as HTMLButtonElement;
            const originalButtonHTML = exportButton?.innerHTML;

            // Set loading state
            if (exportButton) {
                exportButton.disabled = true;
                exportButton.style.opacity = "0.6";
                exportButton.innerHTML = `<span class="text-sm">Exporting...</span>`;
            }

            try {
                const activeArtifact = getActiveArtifact();

                if (activeArtifact.index === -1) {
                    console.warn("No active artifact found");
                    if (exportButton) {
                        exportButton.disabled = false;
                        exportButton.style.opacity = "1";
                        exportButton.innerHTML =
                            originalButtonHTML ||
                            `<span class="text-sm">Export Artifact</span>`;
                    }
                    return;
                }

                const artifactData = extractCurrentArtifactData(
                    activeArtifact.index
                );

                if (!artifactData) {
                    console.error("Failed to extract artifact data");
                    if (exportButton) {
                        exportButton.disabled = false;
                        exportButton.style.opacity = "1";
                        exportButton.innerHTML =
                            originalButtonHTML ||
                            `<span class="text-sm">Export Artifact</span>`;
                    }
                    return;
                }

                // Create a single message containing the artifact
                const artifactMessage = {
                    role: "assistant",
                    content: artifactData.content,
                };

                const chatData = {
                    title: activeArtifact.title || "Claude Artifact",
                    source: "claude" as const,
                    messages: [artifactMessage],
                    artifacts: [
                        {
                            content: artifactData.content,
                            type: artifactData.type,
                            title: activeArtifact.title,
                            subtitle: activeArtifact.subtitle,
                            artifactIndex: 0,
                        },
                    ],
                };

                // Send to storage
                chrome.storage.local.set({ chatData }, () => {
                    console.log("✅ Artifact exported to ExportMyChat");

                    // Reset button
                    if (exportButton) {
                        exportButton.disabled = false;
                        exportButton.style.opacity = "1";
                        exportButton.innerHTML =
                            originalButtonHTML ||
                            `<span class="text-sm">Export Artifact</span>`;
                    }

                    // Open options page
                    chrome.runtime.sendMessage({ action: "openOptions" });
                });
            } catch (error) {
                console.error("Error exporting artifact:", error);
                if (exportButton) {
                    exportButton.disabled = false;
                    exportButton.style.opacity = "1";
                    exportButton.innerHTML =
                        originalButtonHTML ||
                        `<span class="text-sm">Export Artifact</span>`;
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

            // Create the export button
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
                <span class="mdc-button__label">Export Artifact</span>
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
                handleGeminiArtifactExport();
            });

            console.log("✅ Gemini artifact export button inserted");
        }

        // Function to handle Gemini artifact export Artifact
        async function handleGeminiArtifactExport() {
            const exportButton = document.querySelector(
                "#gemini-artifact-export-button"
            ) as HTMLButtonElement;
            const labelSpan = exportButton?.querySelector(".mdc-button__label");
            const originalLabelText = labelSpan?.textContent;

            // Set loading state
            if (exportButton) {
                exportButton.disabled = true;
                exportButton.style.opacity = "0.6";
                if (labelSpan) {
                    labelSpan.textContent = "Exporting...";
                }
            }

            try {
                const activeArtifact = getActiveGeminiArtifact();

                if (activeArtifact.index === -1) {
                    console.warn("No active Gemini artifact found");
                    if (exportButton) {
                        exportButton.disabled = false;
                        exportButton.style.opacity = "1";
                        if (labelSpan) {
                            labelSpan.textContent =
                                originalLabelText || "Export Artifact";
                        }
                    }
                    return;
                }

                const artifactData = extractCurrentGeminiArtifactData(
                    activeArtifact.index
                );

                if (!artifactData) {
                    console.error("Failed to extract Gemini artifact data");
                    if (exportButton) {
                        exportButton.disabled = false;
                        exportButton.style.opacity = "1";
                        if (labelSpan) {
                            labelSpan.textContent =
                                originalLabelText || "Export Artifact";
                        }
                    }
                    return;
                }

                // Wrap code content in proper HTML structure for display
                const codeContent = `<div class="attachment-container">
    <pre><code class="language-${artifactData.type}">${escapeHtml(
                    artifactData.content
                )}</code></pre>
</div>`;

                // Create a single message containing the artifact
                const artifactMessage = {
                    role: "model",
                    content: codeContent,
                };

                const chatData = {
                    title: activeArtifact.title || "Gemini Code",
                    source: "gemini" as const,
                    messages: [artifactMessage],
                    artifacts: [],
                };

                // Send to storage
                chrome.storage.local.set({ chatData }, () => {
                    console.log("✅ Gemini artifact exported to ExportMyChat");

                    // Reset button
                    if (exportButton) {
                        exportButton.disabled = false;
                        exportButton.style.opacity = "1";
                        if (labelSpan) {
                            labelSpan.textContent =
                                originalLabelText || "Export Artifact";
                        }
                    }

                    // Open options page
                    chrome.runtime.sendMessage({ action: "openOptions" });
                });
            } catch (error) {
                console.error("Error exporting Gemini artifact:", error);
                if (exportButton) {
                    exportButton.disabled = false;
                    exportButton.style.opacity = "1";
                    if (labelSpan) {
                        labelSpan.textContent =
                            originalLabelText || "Export Artifact";
                    }
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
                            } = { role, content };

                            if (images.length > 0) message.images = images;

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
                            artifacts: [],
                        },
                        savedChatId: null,
                        pdfSettings: null,
                    },
                    () => {
                        chrome.runtime.sendMessage({ action: "openOptions" });
                        console.log("Claude chat data saved:", messages);

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
                            artifacts: [],
                        },
                        savedChatId: null,
                        pdfSettings: null,
                    },
                    () => {
                        chrome.runtime.sendMessage({ action: "openOptions" });
                        console.log("Gemini chat data saved:", messages);

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

        // Function to extract DeepSeek chat data
        async function extractDeepSeekData() {
            console.log("Extracting DeepSeek chat data...");

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
                        <span class="">Extracting...</span>
                    `;
                }

                // Extract chat title - from page title or default
                let title = document.title.replace(" - DeepSeek", "").trim();
                if (!title || title === "DeepSeek") {
                    title = "DeepSeek Chat";
                }

                const messages: any[] = [];

                // Find all message pairs
                const messageContainers = document.querySelectorAll(
                    "._9663006[data-um-id]"
                );
                console.log(`Found ${messageContainers.length} messages`);

                for (const container of Array.from(messageContainers)) {
                    try {
                        // Check if it's a user message
                        const userMessageDiv = container.querySelector(
                            ".d29f3d7d.ds-message"
                        );
                        if (userMessageDiv) {
                            // Extract uploaded files (if any)
                            const fileContainers =
                                container.querySelectorAll(
                                    "._76cd190._0004e59"
                                );
                            const attachments: any[] = [];

                            for (const fileContainer of Array.from(
                                fileContainers
                            )) {
                                const fileNameEl =
                                    fileContainer.querySelector(".f3a54b52");
                                const fileTypeEl =
                                    fileContainer.querySelector("._5119742");

                                if (fileNameEl) {
                                    const fileName =
                                        fileNameEl.textContent?.trim() || "";
                                    const fileType =
                                        fileTypeEl?.textContent?.trim() || "";

                                    attachments.push({
                                        type: fileType.includes("PDF")
                                            ? "document"
                                            : fileType.includes("PNG") ||
                                              fileType.includes("JPG") ||
                                              fileType.includes("JPEG")
                                            ? "image"
                                            : "file",
                                        name: fileName,
                                        info: fileType,
                                    });
                                }
                            }

                            // Extract user text message
                            const userTextDiv =
                                container.querySelector(".fbb737a4");
                            if (userTextDiv) {
                                const userText =
                                    userTextDiv.textContent?.trim() || "";

                                messages.push({
                                    role: "user",
                                    content: userText,
                                    attachments:
                                        attachments.length > 0
                                            ? attachments
                                            : undefined,
                                });
                            }
                        }

                        // Check if there's an assistant response following this user message
                        // DeepSeek puts assistant responses in sibling elements with class _4f9bf79
                        let nextSibling = container.nextElementSibling;
                        while (
                            nextSibling &&
                            !nextSibling.classList.contains("_9663006")
                        ) {
                            if (nextSibling.classList.contains("_4f9bf79")) {
                                const assistantMessageDiv =
                                    nextSibling.querySelector(".ds-markdown");
                                if (assistantMessageDiv) {
                                    // Clone the message div for processing
                                    const clonedDiv =
                                        assistantMessageDiv.cloneNode(
                                            true
                                        ) as HTMLElement;

                                    // Process code blocks
                                    const codeBlocks =
                                        clonedDiv.querySelectorAll(
                                            ".md-code-block"
                                        );
                                    codeBlocks.forEach((codeBlock) => {
                                        const preElement =
                                            codeBlock.querySelector("pre");
                                        if (preElement) {
                                            const codeText =
                                                preElement.textContent || "";
                                            const languageEl =
                                                codeBlock.querySelector(
                                                    ".d813de27"
                                                );
                                            const language =
                                                languageEl?.textContent?.trim() ||
                                                "";
                                            const header =
                                                document.createElement("div");
                                            header.className = "code-header";
                                            header.textContent = language;

                                            // Escape HTML entities to prevent rendering
                                            const escapedCode = codeText
                                                .replace(/&/g, "&amp;")
                                                .replace(/</g, "&lt;")
                                                .replace(/>/g, "&gt;")
                                                .replace(/"/g, "&quot;")
                                                .replace(/'/g, "&#039;");

                                            // Replace with formatted code block
                                            const codeDiv =
                                                document.createElement("div");
                                            codeDiv.className = "deepseek-code";
                                            codeDiv.innerHTML = `<pre><code class="language-${language}">${escapedCode}</code></pre>`;
                                            codeBlock.replaceWith(codeDiv);
                                            codeDiv.prepend(header);
                                        }
                                    });

                                    // Get the processed HTML
                                    let assistantHTML = clonedDiv.innerHTML;

                                    // Clean up any remaining internal spans
                                    assistantHTML = assistantHTML
                                        .replace(/<span[^>]*>/g, "")
                                        .replace(/<\/span>/g, "");

                                    messages.push({
                                        role: "assistant",
                                        content: assistantHTML,
                                    });
                                }
                                break;
                            }
                            nextSibling = nextSibling.nextElementSibling;
                        }
                    } catch (error) {
                        console.error("Error processing message:", error);
                    }
                }

                console.log("Extracted messages:", messages);

                // Save data and open options page
                chrome.storage.local.set(
                    {
                        chatData: {
                            title,
                            messages,
                            source: "deepseek",
                        },
                        savedChatId: null,
                        pdfSettings: null,
                    },
                    () => {
                        chrome.runtime.sendMessage({ action: "openOptions" });
                    }
                );
            } catch (error) {
                console.error("Error extracting DeepSeek data:", error);
                alert("Failed to extract chat data. Please try again.");
            } finally {
                // Reset button
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
                "ExportMyChat: ❤️❤️❤️ Inserting export button...",
                isChatGPT,
                isClaude,
                isGemini,
                isDeepSeek
            );
            if (isChatGPT) {
                insertChatGPTButton();
            } else if (isClaude) {
                insertClaudeButton();
            } else if (isGemini) {
                insertGeminiButton();
            } else if (isDeepSeek) {
                insertDeepSeekButton();
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
                        `Chat changed from ${currentChatId} to ${newChatId}`
                    );
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
                    "ExportMyChat: ❤️❤️❤️ URL change detected",
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

        // ==========================================
        // INDIVIDUAL RESPONSE EXPORT FUNCTIONALITY
        // ==========================================

        // Get extension icon URL for export buttons
        const exportIconUrl = chrome.runtime.getURL("icon/32.png");

        // Function to export a single Claude response
        function exportClaudeResponse(responseContainer: Element) {
            try {
                // Get chat title
                let title = "";
                const titleElement = document.querySelector(
                    '[data-testid="chat-title-button"]'
                );
                if (titleElement) {
                    title =
                        titleElement.textContent?.trim() || "Claude Response";
                }

                // Get the response content
                const content = responseContainer.innerHTML?.trim() || "";

                if (!content) {
                    console.warn("No content found in Claude response");
                    return;
                }

                const chatData = {
                    title: title || "Claude Response",
                    source: "claude" as const,
                    messages: [{ role: "assistant", content }],
                    artifacts: [],
                };

                chrome.storage.local.set(
                    { chatData, savedChatId: null, pdfSettings: null },
                    () => {
                        chrome.runtime.sendMessage({ action: "openOptions" });
                        console.log("✅ Claude response exported");
                    }
                );
            } catch (error) {
                console.error("Error exporting Claude response:", error);
            }
        }

        // Function to export a single ChatGPT response
        function exportChatGPTResponse(turnElement: Element) {
            try {
                // Get chat title
                let title = "";
                const activeLink = document.querySelector(
                    'nav[aria-label="Chat history"] a[data-active]'
                );
                if (activeLink) {
                    title = activeLink.textContent?.trim() || "";
                }

                // Get the assistant content
                const assistantContent = turnElement.querySelector(
                    '[data-message-author-role="assistant"]'
                );
                const content = assistantContent?.innerHTML?.trim() || "";

                // Get any generated images
                const images: string[] = [];
                const imageElements = turnElement.querySelectorAll(
                    'img[alt="Generated image"]'
                );
                imageElements.forEach((img) => {
                    const src = (img as HTMLImageElement).src;
                    if (src && !images.includes(src)) {
                        images.push(src);
                    }
                });

                if (!content && images.length === 0) {
                    console.warn("No content found in ChatGPT response");
                    return;
                }

                const message: {
                    role: string;
                    content: string;
                    images?: string[];
                } = {
                    role: "assistant",
                    content,
                };
                if (images.length > 0) message.images = images;

                const chatData = {
                    title: title || "ChatGPT Response",
                    source: "chatgpt" as const,
                    messages: [message],
                };

                chrome.storage.local.set(
                    { chatData, savedChatId: null, pdfSettings: null },
                    () => {
                        chrome.runtime.sendMessage({ action: "openOptions" });
                        console.log("✅ ChatGPT response exported");
                    }
                );
            } catch (error) {
                console.error("Error exporting ChatGPT response:", error);
            }
        }

        // Function to export a single Gemini response
        async function exportGeminiResponse(modelResponse: Element) {
            try {
                // Get chat title
                let title = "";
                const titleElement = document.querySelector(
                    ".conversation-title"
                );
                if (titleElement) {
                    title =
                        titleElement.textContent?.trim() || "Gemini Response";
                }

                // Get the message content
                const messageContent = modelResponse.querySelector(
                    "message-content .markdown"
                );
                const content = messageContent?.innerHTML?.trim() || "";

                // Get any generated images
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

                // Convert images to data URLs
                if (images.length > 0) {
                    const dataUrlPromises = images.map((url) =>
                        imageUrlToDataUrl(url)
                    );
                    const dataUrls = await Promise.all(dataUrlPromises);
                    images.length = 0;
                    images.push(...dataUrls);
                }

                if (!content && images.length === 0) {
                    console.warn("No content found in Gemini response");
                    return;
                }

                const message: {
                    role: string;
                    content: string;
                    images?: string[];
                } = {
                    role: "assistant",
                    content,
                };
                if (images.length > 0) message.images = images;

                const chatData = {
                    title: title || "Gemini Response",
                    source: "gemini" as const,
                    messages: [message],
                    artifacts: [],
                };

                chrome.storage.local.set(
                    { chatData, savedChatId: null, pdfSettings: null },
                    () => {
                        chrome.runtime.sendMessage({ action: "openOptions" });
                        console.log("✅ Gemini response exported");
                    }
                );
            } catch (error) {
                console.error("Error exporting Gemini response:", error);
            }
        }

        // Function to export a single DeepSeek response
        function exportDeepSeekResponse(assistantMessageDiv: Element) {
            try {
                // Get chat title
                let title = document.title.replace(" - DeepSeek", "").trim();
                if (!title || title === "DeepSeek") {
                    title = "DeepSeek Response";
                }

                // Clone the message div for processing
                const clonedDiv = assistantMessageDiv.cloneNode(
                    true
                ) as HTMLElement;

                // Process code blocks
                const codeBlocks = clonedDiv.querySelectorAll(".md-code-block");
                codeBlocks.forEach((codeBlock) => {
                    const preElement = codeBlock.querySelector("pre");
                    if (preElement) {
                        const codeText = preElement.textContent || "";
                        const languageEl = codeBlock.querySelector(".d813de27");
                        const language = languageEl?.textContent?.trim() || "";
                        const header = document.createElement("div");
                        header.className = "code-header";
                        header.textContent = language;

                        // Escape HTML entities
                        const escapedCode = codeText
                            .replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/"/g, "&quot;")
                            .replace(/'/g, "&#039;");

                        // Replace with formatted code block
                        const codeDiv = document.createElement("div");
                        codeDiv.className = "deepseek-code";
                        codeDiv.innerHTML = `<pre><code class="language-${language}">${escapedCode}</code></pre>`;
                        codeBlock.replaceWith(codeDiv);
                        codeDiv.prepend(header);
                    }
                });

                // Get the processed HTML
                let assistantHTML = clonedDiv.innerHTML;
                assistantHTML = assistantHTML
                    .replace(/<span[^>]*>/g, "")
                    .replace(/<\/span>/g, "");

                if (!assistantHTML) {
                    console.warn("No content found in DeepSeek response");
                    return;
                }

                const chatData = {
                    title,
                    source: "deepseek" as const,
                    messages: [{ role: "assistant", content: assistantHTML }],
                };

                chrome.storage.local.set(
                    { chatData, savedChatId: null, pdfSettings: null },
                    () => {
                        chrome.runtime.sendMessage({ action: "openOptions" });
                        console.log("✅ DeepSeek response exported");
                    }
                );
            } catch (error) {
                console.error("Error exporting DeepSeek response:", error);
            }
        }

        // Function to insert export button for Claude responses
        function insertClaudeResponseExportButtons() {
            // Find all Claude assistant response containers (font-claude-response)
            const responseContainers = document.querySelectorAll(
                ".font-claude-response"
            );

            responseContainers.forEach((responseContainer) => {
                // Find the action bar within or near this response
                // The action bar is a sibling or child element with the specific classes
                const parentElement = responseContainer.parentElement;
                if (!parentElement) return;

                // Look for the action bar in the parent's children or siblings
                let actionBar = parentElement.querySelector(
                    ".text-text-300.flex.items-stretch.justify-between"
                );

                // If not found directly, try looking in the grandparent
                if (!actionBar && parentElement.parentElement) {
                    actionBar = parentElement.parentElement.querySelector(
                        ".text-text-300.flex.items-stretch.justify-between"
                    );
                }

                if (!actionBar) return;

                // Skip if already has export button
                if (actionBar.querySelector(".response-export-btn")) return;

                // Create the export button wrapper
                const buttonWrapper = document.createElement("div");
                buttonWrapper.className = "w-fit";
                buttonWrapper.setAttribute("data-state", "closed");

                const exportButton = document.createElement("button");
                exportButton.className = `response-export-btn inline-flex items-center justify-center relative shrink-0 can-focus select-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none border-transparent transition font-base duration-300 ease-[cubic-bezier(0.165,0.85,0.45,1)] h-8 w-8 rounded-md active:scale-95 group/btn Button_ghost__BUAoh`;
                exportButton.type = "button";
                exportButton.setAttribute("aria-label", "Export Response");
                exportButton.title = "Export this response";

                exportButton.innerHTML = `
                    <div class="flex items-center justify-center text-text-500 group-hover/btn:text-text-100" style="width: 20px; height: 20px;">
                        <img src="${exportIconUrl}" width="18" height="18" />
                    </div>
                `;

                exportButton.addEventListener("click", () => {
                    exportClaudeResponse(responseContainer);
                });

                buttonWrapper.appendChild(exportButton);

                // Insert before the retry button container (the .flex.items-center div)
                // Use Array.from().find() to ensure we get a direct child and avoid nested .flex.items-center elements
                const retryButtonContainer = Array.from(
                    actionBar.children
                ).find(
                    (child) =>
                        child.classList.contains("flex") &&
                        child.classList.contains("items-center")
                );

                if (retryButtonContainer) {
                    actionBar.insertBefore(buttonWrapper, retryButtonContainer);
                } else {
                    actionBar.appendChild(buttonWrapper);
                }
            });
        }

        // Function to insert export button for ChatGPT responses
        function insertChatGPTResponseExportButtons() {
            // Find all ChatGPT turn action button containers
            const actionContainers = document.querySelectorAll(
                '[data-testid="conversation-turn-"] .flex.flex-wrap.items-center, [class*="group-hover/turn-messages"]'
            );

            actionContainers.forEach((container) => {
                // Skip if already has export button
                if (container.querySelector(".response-export-btn")) return;

                // Find the parent turn element
                const turnElement = container.closest(
                    '[data-testid^="conversation-turn"]'
                );
                if (!turnElement) return;

                // Only add to assistant responses
                const isAssistant = turnElement.querySelector(
                    '[data-message-author-role="assistant"]'
                );
                if (!isAssistant) return;

                // Create the export button
                const exportButton = document.createElement("button");
                exportButton.className =
                    "response-export-btn text-token-text-secondary hover:bg-token-bg-secondary rounded-lg";
                exportButton.setAttribute("aria-label", "Export Response");
                exportButton.title = "Export this response";

                exportButton.innerHTML = `
                    <span class="flex items-center justify-center touch:w-10 h-8 w-8">
                        <img src="${exportIconUrl}" width="18" height="18" class="icon" />
                    </span>
                `;

                exportButton.addEventListener("click", () => {
                    exportChatGPTResponse(turnElement);
                });

                // Insert at the end of the button group
                container.prepend(exportButton);
            });
        }

        // Function to insert export button for Gemini responses
        function insertGeminiResponseExportButtons() {
            // Find all Gemini response action containers
            const actionContainers = document.querySelectorAll(
                ".buttons-container-v2"
            );

            actionContainers.forEach((container) => {
                // Skip if already has export button
                if (container.querySelector(".response-export-btn")) return;

                // Find the model-response parent
                const modelResponse = container.closest("model-response");
                if (!modelResponse) return;

                // Create the export button
                const exportButton = document.createElement("button");
                exportButton.className =
                    "response-export-btn mdc-icon-button mat-mdc-icon-button mat-mdc-button-base mat-mdc-tooltip-trigger icon-button mat-unthemed";
                exportButton.setAttribute("mat-button", "");
                exportButton.setAttribute("tabindex", "0");
                exportButton.setAttribute("aria-label", "Export Response");
                exportButton.title = "Export this response";

                exportButton.innerHTML = `
                    <span class="mat-mdc-button-persistent-ripple mdc-button__ripple"></span>
                    <img src="${exportIconUrl}" style="width: 18px; height: 18px;" />
                    <span class="mat-focus-indicator"></span>
                    <span class="mat-mdc-button-touch-target"></span>
                    <span class="mat-ripple mat-mdc-button-ripple"></span>
                `;

                exportButton.addEventListener("click", () => {
                    exportGeminiResponse(modelResponse);
                });
                container.appendChild(exportButton);
                // Insert before the spacer
                const spacer = container.querySelector(".spacer");
                if (spacer) {
                    container.insertAdjacentElement("afterend", spacer);
                } else {
                    container.appendChild(exportButton);
                }
            });
        }

        // Function to insert export button for DeepSeek responses
        function insertDeepSeekResponseExportButtons() {
            // Find all DeepSeek response action containers
            const actionContainers =
                document.querySelectorAll(".ds-flex._0a3d93b");

            actionContainers.forEach((container) => {
                // Skip if already has export button
                if (container.querySelector(".response-export-btn")) return;

                // Find the assistant message content
                const parentMessage = container.closest("._4f9bf79");
                if (!parentMessage) return;

                const assistantMessageDiv =
                    parentMessage.querySelector(".ds-markdown");
                if (!assistantMessageDiv) return;

                // Find the button group container
                const buttonGroup = container.querySelector(
                    ".ds-flex._965abe9._54866f7"
                );
                if (!buttonGroup) return;

                // Create the export button
                const exportButton = document.createElement("div");
                exportButton.className =
                    "response-export-btn db183363 ds-icon-button ds-icon-button--m ds-icon-button--sizing-container";
                exportButton.setAttribute("tabindex", "0");
                exportButton.setAttribute("role", "button");
                exportButton.setAttribute("aria-disabled", "false");
                exportButton.title = "Export this response";

                exportButton.innerHTML = `
                    <div class="ds-icon-button__hover-bg"></div>
                    <div class="ds-icon">
                        <img src="${exportIconUrl}" width="18" height="18" />
                    </div>
                    <div class="ds-focus-ring"></div>
                `;

                exportButton.addEventListener("click", () => {
                    exportDeepSeekResponse(assistantMessageDiv);
                });

                // Insert at the end of the button group
                buttonGroup.appendChild(exportButton);
            });
        }

        // Function to insert response export buttons based on platform
        function insertResponseExportButtons() {
            if (!isOnChatPage()) return;

            if (isClaude) {
                insertClaudeResponseExportButtons();
            } else if (isChatGPT) {
                insertChatGPTResponseExportButtons();
            } else if (isGemini) {
                insertGeminiResponseExportButtons();
            } else if (isDeepSeek) {
                insertDeepSeekResponseExportButtons();
            }
        }

        // Set up MutationObserver to watch for DOM changes
        const observer = new MutationObserver(() => {
            checkUrlChange();

            console.log(
                "ExportMyChat: ❤️❤️❤️ URL change detected",
                isOnChatPage()
            );

            if (
                isOnChatPage() &&
                !document.querySelector("#export-chat-button")
            ) {
                console.log(
                    "ExportMyChat: ❤️❤️❤️ Inserting export button...",
                    isChatGPT,
                    isClaude,
                    isGemini,
                    isDeepSeek
                );
                insertExportButton();
            }

            // For Claude: also check for artifact panel
            if (isClaude && isOnChatPage()) {
                if (!document.querySelector("#artifact-export-button")) {
                    insertArtifactExportButton();
                }
            }

            // For Gemini: also check for artifact (code) panel
            if (isGemini && isOnChatPage()) {
                if (!document.querySelector("#gemini-artifact-export-button")) {
                    insertGeminiArtifactExportButton();
                }
            }

            // Insert response export buttons for all platforms
            insertResponseExportButtons();
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
