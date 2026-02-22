"use client";

import React, { useState, useMemo } from 'react';
import { MARAUDER_COMMANDS } from '@/constants/commands';
import { Search } from 'lucide-react';

interface CommandGuideProps {
    onSelect: (cmd: string) => void;
}

const CommandGuide: React.FC<CommandGuideProps> = ({ onSelect }) => {
    const [filter, setFilter] = useState("");

    const filtered = useMemo(() => {
        const lowerFilter = filter.toLowerCase();
        return MARAUDER_COMMANDS.filter(c =>
            c.cmd.toLowerCase().includes(lowerFilter) ||
            c.description.toLowerCase().includes(lowerFilter) ||
            c.category.toLowerCase().includes(lowerFilter)
        );
    }, [filter]);

    return (
        <div className="glass-panel" style={{ padding: '15px', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' }}>
            <h2 className="neon-text" style={{ fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <Search size={18} /> GUIDES
            </h2>

            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Search commands..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--panel-border)',
                        padding: '10px 10px 10px 35px',
                        color: 'white',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '0.9rem'
                    }}
                />
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>
                {filtered.map((c, i) => (
                    <button
                        key={`${c.cmd}-${i}`}
                        onClick={() => onSelect(c.cmd)}
                        style={{
                            textAlign: 'left',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--panel-border)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.background = 'rgba(255, 47, 146, 0.05)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = 'var(--panel-border)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '0.95rem' }}>{c.cmd}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{c.category}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.2' }}>{c.description}</div>
                    </button>
                ))}
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px', fontSize: '0.9rem' }}>
                        No commands found
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommandGuide;
