"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

interface TerminalComponentProps {
    onCommand: (cmd: string) => void;
    incomingData: string;
    theme: 'pink' | 'green' | 'blue';
}

type XtermViewportLike = {
    _innerRefresh?: () => void;
    _renderService?: {
        dimensions?: unknown;
    };
};

type XtermCoreLike = {
    viewport?: XtermViewportLike;
};

type PatchedTerminal = Terminal & {
    _core?: XtermCoreLike;
};

const TerminalComponent: React.FC<TerminalComponentProps> = ({ onCommand, incomingData, theme }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const themeRef = useRef<'pink' | 'green' | 'blue'>(theme);
    const commandRef = useRef<string>("");
    const isAlive = useRef<boolean>(false);
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const safeWrite = useCallback((data: string) => {
        if (isAlive.current && xtermRef.current) {
            try {
                xtermRef.current.write(data);
            } catch (e) {
                console.warn("Terminal write suppressed:", e);
            }
        }
    }, []);

    const safeResize = useCallback(() => {
        if (!isAlive.current || !xtermRef.current || !containerRef.current) return;

        const term = xtermRef.current;
        const container = containerRef.current;

        // Heuristic values for character dimensions based on font-size 14px and JetBrains Mono
        // These might need fine-tuning based on actual rendering
        const charWidth = 8.4; // Approximate width of a character
        const charHeight = 18; // Approximate height of a character (line height)

        // Calculate columns and rows based on container dimensions
        // Ensure minimum dimensions to prevent issues with very small containers
        const cols = Math.max(20, Math.floor(container.clientWidth / charWidth));
        const rows = Math.max(5, Math.floor(container.clientHeight / charHeight));

        try {
            // Only resize if we have valid positive dimensions
            if (cols > 0 && rows > 0) {
                term.resize(cols, rows);
            }
        } catch (e) {
            console.warn("Terminal resize suppressed:", e);
        }
    }, []);

    // Atomic setup and teardown via functional ref
    const getThemeColors = useCallback((t: 'pink' | 'green' | 'blue') => {
        switch (t) {
            case 'green': return { accent: '#00ff9c', glow: 'rgba(0, 255, 156, 0.3)' };
            case 'blue': return { accent: '#00d4ff', glow: 'rgba(0, 212, 255, 0.3)' };
            default: return { accent: '#ff2f92', glow: 'rgba(255, 47, 146, 0.3)' };
        }
    }, []);

    const setTerminalRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            // SETUP
            containerRef.current = node;
            isAlive.current = true;

            const colors = getThemeColors(theme);
            const term = new Terminal({
                theme: {
                    background: '#0a0a0a',
                    foreground: colors.accent,
                    cursor: colors.accent,
                    selectionBackground: colors.glow,
                },
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 14,
                cursorBlink: true,
                convertEol: true,
            });

            term.open(node);
            xtermRef.current = term;

            // CRITICAL: Monkey-patch xterm's internal Viewport to prevent
            // "Cannot read properties of undefined (reading 'dimensions')"
            // This error occurs inside xterm's own code when Viewport._innerRefresh
            // runs before _renderService is initialized or after it's disposed.
            try {
                const viewport = (term as PatchedTerminal)._core?.viewport;
                if (viewport && viewport._innerRefresh) {
                    const origInnerRefresh = viewport._innerRefresh.bind(viewport);
                    viewport._innerRefresh = function () {
                        if (this._renderService?.dimensions) {
                            origInnerRefresh();
                        }
                    };
                }
            } catch {
                // Patching failed, non-critical
            }

            term.writeln('\x1b[1;35mESP32 Marauder Web CLI // System Ready\x1b[0m');
            term.write('\x1b[32m>\x1b[0m ');

            term.onData(data => {
                if (!isAlive.current) return;
                const code = data.charCodeAt(0);
                if (code === 13) { // Enter
                    const cmd = commandRef.current.trim();
                    onCommand(cmd);
                    term.writeln('');
                    commandRef.current = "";
                    term.write('\x1b[32m>\x1b[0m ');
                } else if (code === 127) { // Backspace
                    if (commandRef.current.length > 0) {
                        commandRef.current = commandRef.current.slice(0, -1);
                        term.write('\b \b');
                    }
                } else {
                    commandRef.current += data;
                    term.write(data);
                }
            });

            // Initial resize after a short delay to ensure DOM settle
            setTimeout(safeResize, 100);
        } else {
            // TEARDOWN
            isAlive.current = false;
            if (xtermRef.current) {
                try {
                    xtermRef.current.dispose();
                } catch (e) {
                    console.warn("Terminal disposal error:", e);
                }
                xtermRef.current = null;
            }
            containerRef.current = null;
        }
    }, [getThemeColors, onCommand, safeResize, theme]);

    // Handle theme changes
    useEffect(() => {
        if (xtermRef.current && isAlive.current && themeRef.current !== theme) {
            themeRef.current = theme;
            const colors = getThemeColors(theme);
            xtermRef.current.options.theme = {
                background: '#0a0a0a',
                foreground: colors.accent,
                cursor: colors.accent,
                selectionBackground: colors.glow,
            };
        }
    }, [theme, getThemeColors]);

    // Handle incoming serial data
    useEffect(() => {
        if (incomingData) {
            safeWrite(incomingData);
        }
    }, [incomingData, safeWrite]);

    // Resize observer for the container and window resize listener
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(safeResize);
        });

        observer.observe(containerRef.current);
        window.addEventListener('resize', safeResize);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', safeResize);
        };
    }, [safeResize]);

    const handleSendInput = () => {
        const cmd = inputValue.trim();
        if (cmd) {
            onCommand(cmd);
            if (xtermRef.current && isAlive.current) {
                try {
                    xtermRef.current.writeln(`\x1b[32m${cmd}\x1b[0m`);
                    xtermRef.current.write('\x1b[32m>\x1b[0m ');
                } catch (e) {
                    console.warn("Terminal write on input suppressed:", e);
                }
            }
            setInputValue("");
        }
    };

    return (
        <div className="terminal-container glass-panel" style={{
            height: '100%',
            minHeight: '450px',
            padding: '10px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: '1px solid var(--panel-border)'
        }}>
            <div ref={setTerminalRef} style={{ flex: 1, width: '100%', overflow: 'hidden' }} />

            {/* COMMAND ENTRY AREA */}
            <div style={{
                marginTop: '10px',
                display: 'flex',
                gap: '10px',
                background: 'rgba(0,0,0,0.6)',
                padding: '12px 15px',
                borderRadius: '8px',
                border: '1px solid var(--accent)',
                boxShadow: '0 0 15px rgba(255, 47, 146, 0.1)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent)', fontWeight: 'bold', fontSize: '1rem' }}>&gt;_</div>
                <input
                    ref={inputRef}
                    autoFocus
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendInput();
                    }}
                    placeholder="Type Marauder command..."
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        outline: 'none',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '1rem'
                    }}
                />
                <button
                    onClick={handleSendInput}
                    style={{
                        background: 'var(--accent)',
                        color: 'black',
                        border: 'none',
                        padding: '6px 20px',
                        borderRadius: '4px',
                        fontWeight: '900',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 0 10px var(--accent-glow)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 0 20px var(--accent-glow)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 0 10px var(--accent-glow)';
                    }}
                >
                    EXECUTE
                </button>
            </div>
        </div>
    );
};

export default TerminalComponent;
