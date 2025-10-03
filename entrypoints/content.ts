export default defineContentScript({
    matches: ["https://chatgpt.com/*", "https://chat.openai.com/*"],
    main() {
        console.log("Content script loaded");
        document.addEventListener("click", () => {
            console.log("Extracting chat data...");

            try {
                // Find all conversation turns based on the structure you provided
                const turns = document.querySelectorAll(
                    '[data-testid^="conversation-turn"]'
                );
                const messages: { role: string; content: string }[] = [];

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
                        // Extract user message content
                        const userBubble = turn.querySelector(
                            ".user-message-bubble-color, [data-multiline]"
                        );
                        content = userBubble?.textContent?.trim() || "";
                    } else if (isAssistant) {
                        role = "assistant";
                        // Extract assistant message content
                        const assistantContent = turn.querySelector(
                            '[data-message-author-role="assistant"]'
                        );
                        content = assistantContent?.innerHTML?.trim() || "";
                    }

                    if (content) {
                        messages.push({ role, content });
                    }
                });

                chrome.storage.local.set({ chatData: messages }, () => {
                    chrome.runtime.sendMessage({ action: "openOptions" });
                    console.log("Chat data saved:", messages);
                });

            } catch (error) {
                console.error("Error extracting chat data:", error);
                alert("Error extracting chat data. Please try again.");
            }
        });
    },
});
