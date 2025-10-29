import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ["@wxt-dev/module-react"],
    manifest: {
        name: "Chat2Pdf",
        description: "A browser extension for converting AI chats to PDF",
        version: "13.2.0",
        permissions: ["activeTab", "downloads", "storage"],
        host_permissions: [
            "https://chatgpt.com/*",
            "https://chat.openai.com/*",
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
