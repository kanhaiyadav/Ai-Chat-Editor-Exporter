// This script runs in the page context (not isolated)
// It has access to window.monaco and can extract code

console.log("[Monaco Extractor] Script loaded in page context");

// Listen for extraction requests from content script
window.addEventListener("monaco-data-request", (event) => {
    console.log("[Monaco Extractor] Received extraction request", event.detail);

    const { eventId } = event.detail;
    let result = null;

    try {
        // Check if Monaco is available
        if (typeof monaco !== "undefined" && monaco.editor) {
            console.log("[Monaco Extractor] Monaco is available");

            const models = monaco.editor.getModels();
            console.log(
                `[Monaco Extractor] Found ${models.length} Monaco models`
            );

            if (models && models.length > 0) {
                // Find the largest model (usually the main editor content)
                let largestModel = models[0];
                let maxLineCount = 0;

                models.forEach((model, idx) => {
                    const lineCount = model.getLineCount();
                    const language = model.getLanguageId();
                    const uri = model.uri.toString();

                    console.log(
                        `[Monaco Extractor] Model ${idx}: ${lineCount} lines, language: ${language}, uri: ${uri}`
                    );

                    if (lineCount > maxLineCount) {
                        maxLineCount = lineCount;
                        largestModel = model;
                    }
                });

                const content = largestModel.getValue();
                const language = largestModel.getLanguageId();

                result = {
                    content: content,
                    language: language,
                    lineCount: maxLineCount,
                };

                console.log(
                    `[Monaco Extractor] SUCCESS: Extracted ${content.length} characters, ${maxLineCount} lines, language: ${language}`
                );
            } else {
                console.warn("[Monaco Extractor] No models found");
            }
        } else {
            console.warn(
                "[Monaco Extractor] Monaco not available in page context"
            );
        }
    } catch (error) {
        console.error("[Monaco Extractor] Error:", error);
    }

    // Send response back to content script
    window.dispatchEvent(
        new CustomEvent("monaco-data-response", {
            detail: {
                eventId: eventId,
                data: result,
            },
        })
    );
});

console.log("[Monaco Extractor] Listening for extraction requests...");

// Signal that the extractor is ready
window.dispatchEvent(new CustomEvent("monaco-extractor-ready"));
console.log("[Monaco Extractor] Ready signal sent");
