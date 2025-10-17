export interface Message {
    role: string;
    content: string;
}

export interface PDFSettings {
    layout: "chat" | "qa" | "document";
    chat: {
        userBubbleColor: string;
        userTextColor: string;
        aiBubbleColor: string;
        aiTextColor: string;
        fontSize: number;
        fontFamily: string;
        bubbleRadius: number;
        spacing: number;
        showAvatars: boolean;
        bubbleStyle: "filled" | "outlined" | "minimal";
    };
    qa: {
        questionColor: string;
        answerColor: string;
        fontSize: number;
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
        fontSize: number;
        fontFamily: string;
        lineHeight: number;
        paragraphSpacing: number;
    };
    general: {
        backgroundColor: string;
        textColor: string;
        pageSize: "a4" | "letter" | "legal";
        margins: number;
        includeHeader: boolean;
        headerText: string;
        includeFooter: boolean;
    };
}

export const defaultSettings: PDFSettings = {
    layout: "chat",
    chat: {
        userBubbleColor: "#ffcc41",
        userTextColor: "#000000",
        aiBubbleColor: "#efefef",
        aiTextColor: "#3c3c3c",
        fontSize: 14,
        fontFamily: "Inter, system-ui, sans-serif",
        bubbleRadius: 16,
        spacing: 12,
        showAvatars: true,
        bubbleStyle: "filled",
    },
    qa: {
        questionColor: "#1e293b",
        answerColor: "#475569",
        fontSize: 14,
        fontFamily: "Georgia, serif",
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
        fontSize: 12,
        fontFamily: "Georgia, serif",
        lineHeight: 1.6,
        paragraphSpacing: 16,
    },
    general: {
        backgroundColor: "#ffffff",
        textColor: "#000000",
        pageSize: "a4",
        margins: 20,
        includeHeader: true,
        headerText: "AI Conversation Export",
        includeFooter: true,
    },
};