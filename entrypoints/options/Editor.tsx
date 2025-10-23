import { useEffect, useRef } from "react";

interface ChatEditorProps {
    initialHtml: string;
    onChange: (html: string) => void;
    onSave?: () => void;
}

export function ChatEditor({ initialHtml, onChange }: ChatEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);

    // Set initial content on mount only
    useEffect(() => {
        if (editorRef.current && isInitialMount.current && initialHtml) {
            editorRef.current.innerHTML = initialHtml;
            isInitialMount.current = false;
        }
    }, [initialHtml]);

    const handleInput = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            onChange(newContent);
        }
    };

    return (
        <div className="w-full border  border-border rounded-lg overflow-hidden bg-background shadow-sm">
            {/* Editor Content */}
            <div className="bg-white max-h-[400px] overflow-y-auto" style={{ scrollbarColor: '#bebebe transparent' }}>
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    className="prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3"
                    style={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        color: "#252525"
                    }}
                    suppressContentEditableWarning
                />
            </div>
        </div>
    );
}
