"use client";

import React, { useEffect, useState } from 'react';

const createBars = (count: number): number[] =>
    Array.from({ length: count }, (_, index) => 35 + ((index * 11) % 55));

const Visualizer: React.FC = () => {
    const [bars, setBars] = useState<number[]>(() => createBars(30));

    useEffect(() => {
        const interval = setInterval(() => {
            setBars(prev => prev.map(h => {
                const change = (Math.random() - 0.5) * 20;
                return Math.max(10, Math.min(100, h + change));
            }));
        }, 150);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 className="neon-text" style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '15px' }}>SIGNAL MONITOR</h2>

            <div style={{
                height: '150px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '2px',
                padding: '10px',
                border: '1px solid var(--panel-border)'
            }}>
                {bars.map((h, i) => (
                    <div
                        key={i}
                        style={{
                            flex: 1,
                            height: `${h}%`,
                            background: h > 80 ? 'var(--accent)' : 'var(--green)',
                            boxShadow: `0 0 10px ${h > 80 ? 'var(--accent-glow)' : 'var(--green-glow)'}`,
                            transition: 'height 0.1s ease-in-out, background 0.3s',
                            opacity: 0.8
                        }}
                    />
                ))}
            </div>

            <div style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)', paddingBottom: '4px' }}>
                    <span>STATUS</span>
                    <span style={{ color: 'var(--green)' }}>SCANNING...</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)', paddingBottom: '4px' }}>
                    <span>AVG RSSI</span>
                    <span>-64 dBm</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>PACKET RATE</span>
                    <span>42 pkts/s</span>
                </div>
            </div>
        </div>
    );
};

export default Visualizer;
