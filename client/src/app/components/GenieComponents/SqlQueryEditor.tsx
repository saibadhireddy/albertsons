/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef } from 'react';

const editorStyles: any = {
    wrapper: {
        display: 'flex',
        backgroundColor: '#1e1e1e',
        fontFamily: "'Fira Code', 'Source Code Pro', monospace",
        fontSize: '13px',
        lineHeight: '20px',
        height: '280px',
        border: '1px solid #333',
        borderRadius: '4px 4px 0 0',
        overflow: 'hidden',
    },
    gutter: {
        width: '45px',
        padding: '16px 0', 
        backgroundColor: '#1e1e1e',
        color: '#6e7681',
        textAlign: 'right' as const,
        borderRight: '1px solid #333',
        userSelect: 'none' as const,
        overflow: 'hidden',
    },
    gutterLine: {
        paddingRight: '12px',
        display: 'block',
        height: '20px',
    },
    textarea: {
        flex: 1,
        padding: '16px',
        backgroundColor: 'transparent',
        color: '#ffffff',
        border: 'none',
        outline: 'none',
        resize: 'none' as const,
        whiteSpace: 'pre',
        overflow: 'auto',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: 'inherit',
        margin: 0,
    }
};

export default function SqlQueryEditor({ value, onChange, isExecuting }: any) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const gutterRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (textareaRef.current && gutterRef.current) {
            gutterRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    const lines = useMemo(() => value.split('\n'), [value]);

    return (
        <div style={editorStyles.wrapper}>
            <div ref={gutterRef} style={editorStyles.gutter}>
                {/* Changed i to number to fix ts(18049) and ts(2365) */}
                {lines.map((_: string, i: number) => (
                    <span key={i} style={editorStyles.gutterLine}>
                        {i + 1}
                    </span>
                ))}
            </div>
            <textarea
                ref={textareaRef}
                style={{ ...editorStyles.textarea, opacity: isExecuting ? 0.6 : 1 }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleScroll}
                spellCheck={false}
                disabled={isExecuting}
            />
        </div>
    );
}