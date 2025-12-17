import { useState, useEffect } from "react";

export interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: "default" | "destructive";
}

let toastCounter = 0;
const listeners: Array<(toast: Toast) => void> = [];

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const listener = (toast: Toast) => {
            setToasts((prev) => [...prev, toast]);

            // Auto remove after 5 seconds
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== toast.id));
            }, 5000);
        };

        listeners.push(listener);

        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, []);

    const toast = ({
        title,
        description,
        variant = "default",
    }: Omit<Toast, "id">) => {
        const id = `toast-${toastCounter++}`;
        const newToast: Toast = { id, title, description, variant };

        listeners.forEach((listener) => listener(newToast));

        // For console logging as fallback
        if (variant === "destructive") {
            console.error(`${title}: ${description}`);
        } else {
            console.log(`${title}: ${description}`);
        }
    };

    return { toast, toasts };
}
