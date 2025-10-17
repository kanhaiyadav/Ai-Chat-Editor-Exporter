export default defineContentScript({
    matches: ["https://chatgpt.com/c/*", "https://chat.openai.com/c/*"],
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
                            "#history a[data-active]"
                        );
                        if (activeLink) {
                            title = activeLink.textContent?.trim() || "";
                        }

                        // Find all conversation turns
                        const turns = document.querySelectorAll(
                            '[data-testid^="conversation-turn"]'
                        );
                        const messages: { role: string; content: string }[] =
                            [];

                        turns.forEach((turn) => {
                            const isUser = turn.querySelector(
                                '[data-message-author-role="user"]'
                            );
                            const isAssistant = turn.querySelector(
                                '[data-message-author-role="assistant"]'
                            );

                            let role = "unknown";
                            let content = "";

                            if (isUser) {
                                role = "user";
                                const userBubble = turn.querySelector(
                                    ".user-message-bubble-color, [data-multiline]"
                                );
                                content = userBubble?.textContent?.trim() || "";
                            } else if (isAssistant) {
                                role = "assistant";
                                const assistantContent = turn.querySelector(
                                    '[data-message-author-role="assistant"]'
                                );
                                content =
                                    assistantContent?.innerHTML?.trim() || "";
                            }

                            if (content) messages.push({ role, content });
                        });

                        // Save to Chrome storage and open options page
                        chrome.storage.local.set(
                            { chatData: messages, chatProps: { title } },
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
