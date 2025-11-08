import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ["@wxt-dev/module-react"],
    manifest: {
        name: "Chat2Pdf",
        description: "A browser extension for converting AI chats to PDF",
        version: "14.0.0",
        content_security_policy: {
            extension_pages: "script-src 'self'; object-src 'self'",
        },
        permissions: ["scripting", "activeTab", "downloads", "storage"],
        host_permissions: [
            "https://chatgpt.com/*",
            "https://chat.openai.com/*",
            "https://claude.ai/*",
            "https://gemini.google.com/*",
            "https://lh3.google.com/*",
            "https://lh3.googleusercontent.com/*",
            "https://chat.deepseek.com/*",
        ],
        web_accessible_resources: [
            {
                resources: ["monaco-extractor.js"],
                matches: ["https://gemini.google.com/*"],
            },
        ],
        options_ui: {
            page: "options.html",
            open_in_tab: true,
        },
    },
    vite: () => ({
        plugins: [tailwindcss()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./"),
            },
        },
    }),
});
