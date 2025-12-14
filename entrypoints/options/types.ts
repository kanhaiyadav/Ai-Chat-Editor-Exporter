export interface Message {
    role: string;
    content: string;
    images?: string[];
    attachments?: Array<{
        name: string;
        preview: string;
        type: string;
        url: string;
    }>;
}

export type ChatSource = "chatgpt" | "claude" | "gemini" | "deepseek";

export interface PDFSettings {
    layout: "chat" | "qa" | "document";
    chat: {
        userBubbleColor: string;
        userTextColor: string;
        aiBubbleColor: string;
        aiTextColor: string;
        fontFamily: string;
        bubbleRadius: number;
        spacing: number;
        showAvatars: boolean;
        bubbleStyle: "filled" | "outlined" | "minimal";
    };
    qa: {
        questionColor: string;
        answerColor: string;
        fontFamily: string;
        showSeparator: boolean;
        separatorStyle: "line" | "dots" | "none";
        numbering: boolean;
        questionPrefix: string;
        answerPrefix: string;
        indentAnswer: boolean;
    };
    document: {
        titleColor: string;
        bodyColor: string;
        fontFamily: string;
    };
    general: {
        backgroundColor: string;
        textColor: string;
        pageSize: "a4" | "letter" | "legal";
        margins: number;
        includeHeader: boolean;
        headerText: string;
        includeFooter: boolean;
        includeUserAttachments: boolean;
        includeUserImages: boolean;
        includeAIImages: boolean;
        fontFamily: {
            type: string;
            value: string;
        } | null;
        fontSize: number;
        lineHeight: number;
    };
}

export const defaultSettings: PDFSettings = {
    layout: "document",
    chat: {
        userBubbleColor: "#ffcc41",
        userTextColor: "#000000",
        aiBubbleColor: "#f3f2f2",
        aiTextColor: "#3c3c3c",
        fontFamily: "Commissioner, sans-serif",
        bubbleRadius: 16,
        spacing: 12,
        showAvatars: true,
        bubbleStyle: "filled",
    },
    qa: {
        questionColor: "#1e293b",
        answerColor: "#475569",
        fontFamily: "Patrick Hand, cursive",
        showSeparator: true,
        separatorStyle: "line",
        numbering: true,
        questionPrefix: "Q:",
        answerPrefix: "A:",
        indentAnswer: true,
    },
    document: {
        titleColor: "#1e293b",
        bodyColor: "#334155",
        fontFamily: "Handlee, cursive",
    },
    general: {
        backgroundColor: "#ffffff",
        textColor: "#000000",
        pageSize: "a4",
        margins: 20,
        includeHeader: true,
        includeAIImages: true,
        includeUserImages: true,
        includeUserAttachments: true,
        headerText: "",
        includeFooter: true,
        fontFamily: {
            type: "Custom",
            value: "Tahoma",
        },
        fontSize: 15,
        lineHeight: 1.4,
    },
};

export type fontFamilies = Array<{
    type: string;
    values: Array<string>;
}>;

export const fontFamilies: fontFamilies = [
    {
        type: "Formal",
        values: [
            "Tinos, serif",
            "Commissioner, sans-serif",
            "Unna, serif",
            "Montserrat, sans-serif",
            "Bitter, serif",
        ],
    },
    {
        type: "Handwriting",
        values: [
            "Patrick Hand, cursive",
            "Merienda, cursive",
            "Caveat, cursive",
        ],
    },
    {
        type: "Stylistic",
        values: [
            "Sofia, cursive",
            "Grand Hotel, cursive",
            "Montez, cursive",
            "Redressed, cursive",
        ],
    },
    {
        type: "Custom",
        values: [], // Will be populated dynamically with system fonts
    },
];
