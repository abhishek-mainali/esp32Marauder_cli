"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useSerial } from '@/hooks/useSerial';
import dynamic from 'next/dynamic';
import { Power, Terminal as TerminalIcon, Cpu, Activity, Zap, Play } from 'lucide-react';
import CommandGuide from '@/components/CommandGuide';
import Visualizer from '@/components/Visualizer';

const TerminalComponent = dynamic(() => import('@/components/Terminal'), { ssr: false });

export default function Home() {
  const { connected, deviceInfo, incomingData, connect, disconnect, send, error } = useSerial();
  const [isExecuting, setIsExecuting] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [zenMode, setZenMode] = useState(false);
  const [theme, setTheme] = useState<'pink' | 'green' | 'blue'>('pink');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const handleCommand = useCallback((cmd: string) => {
    send(cmd);
  }, [send]);

  const runMacro = async (commands: string[]) => {
    if (!connected || isExecuting) return;
    setIsExecuting(true);
    for (const cmd of commands) {
      send(cmd);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    setIsExecuting(false);
  };

  return (
    <main className={`theme-${theme}`} style={{ height: isMobile ? 'auto' : '100vh', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: isMobile ? 'auto' : 'hidden' }}>
      <header className="glass-panel" style={{
        margin: '10px',
        padding: isMobile ? '12px' : '8px 20px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '10px' : '0',
        zIndex: 100,
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
        borderBottom: '1px solid var(--accent-glow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: isMobile ? '100%' : 'auto' }}>
            <div style={{ background: 'rgba(255,47,146,0.1)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
              <Zap size={24} color="var(--accent)" />
            </div>
            <h1 style={{ fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: '900', letterSpacing: isMobile ? '1.5px' : '3px', margin: 0 }}>
              <span className="neon-text">MARAUDER</span> <span style={{ color: 'white', opacity: 0.8 }}>CLI</span>
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              title={leftSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: leftSidebarOpen ? 'var(--accent)' : 'white',
                border: '1px solid var(--panel-border)',
                padding: '6px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: leftSidebarOpen ? '0 0 10px var(--accent-glow)' : 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 0 15px var(--accent-glow)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = leftSidebarOpen ? '0 0 10px var(--accent-glow)' : 'none';
              }}
            >
              <TerminalIcon size={14} />
            </button>
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              title={rightSidebarOpen ? "Hide Stats" : "Show Stats"}
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: rightSidebarOpen ? 'var(--accent)' : 'white',
                border: '1px solid var(--panel-border)',
                padding: '6px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: rightSidebarOpen ? '0 0 10px var(--accent-glow)' : 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 0 15px var(--accent-glow)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = rightSidebarOpen ? '0 0 10px var(--accent-glow)' : 'none';
              }}
            >
              <Activity size={14} />
            </button>
            <button
              onClick={() => {
                setZenMode(!zenMode);
                if (!zenMode) {
                  setLeftSidebarOpen(false);
                  setRightSidebarOpen(false);
                } else {
                  setLeftSidebarOpen(true);
                  setRightSidebarOpen(true);
                }
              }}
              className={zenMode ? "neon-border" : ""}
              style={{
                background: zenMode ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                color: zenMode ? 'black' : 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.65rem',
                fontWeight: '900',
                marginLeft: '5px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: zenMode ? '0 0 15px var(--accent-glow)' : 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                if (!zenMode) e.currentTarget.style.boxShadow = '0 0 10px rgba(255,255,255,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = zenMode ? '0 0 15px var(--accent-glow)' : 'none';
              }}
            >
              ZEN
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginLeft: isMobile ? '0' : '15px', padding: '5px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid var(--panel-border)' }}>
            <button
              onClick={() => setTheme('pink')}
              title="Pink Theme"
              style={{
                width: '16px', height: '16px', borderRadius: '50%', background: '#ff2f92',
                border: theme === 'pink' ? '2px solid white' : 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: theme === 'pink' ? '0 0 10px rgba(255, 47, 146, 0.6)' : 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.3)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 47, 146, 0.8)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = theme === 'pink' ? '0 0 10px rgba(255, 47, 146, 0.6)' : 'none';
              }}
            />
            <button
              onClick={() => setTheme('green')}
              title="Green Theme"
              style={{
                width: '16px', height: '16px', borderRadius: '50%', background: '#00ff9c',
                border: theme === 'green' ? '2px solid white' : 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: theme === 'green' ? '0 0 10px rgba(0, 255, 156, 0.6)' : 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.3)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 156, 0.8)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = theme === 'green' ? '0 0 10px rgba(0, 255, 156, 0.6)' : 'none';
              }}
            />
            <button
              onClick={() => setTheme('blue')}
              title="Blue Theme"
              style={{
                width: '16px', height: '16px', borderRadius: '50%', background: '#00d4ff',
                border: theme === 'blue' ? '2px solid white' : 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: theme === 'blue' ? '0 0 10px rgba(0, 212, 255, 0.6)' : 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.3)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.8)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = theme === 'blue' ? '0 0 10px rgba(0, 212, 255, 0.6)' : 'none';
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'flex-start', gap: '12px', width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
          <div style={{ fontSize: isMobile ? '0.72rem' : '0.8rem', color: connected ? 'var(--green)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? 'var(--green)' : '#444', boxShadow: connected ? '0 0 10px var(--green)' : 'none' }} />
            {connected ? 'LINK: ESTABLISHED' : 'LINK: DISCONNECTED'}
          </div>
          <button
            onClick={connected ? disconnect : () => connect()}
            className={connected ? "" : "neon-border"}
            style={{
              background: connected ? 'rgba(255,47,146,0.1)' : 'var(--accent)',
              border: connected ? '1px solid var(--accent)' : 'none',
              color: connected ? 'var(--accent)' : 'black',
              padding: isMobile ? '8px 14px' : '8px 24px',
              borderRadius: '8px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s',
              fontSize: isMobile ? '0.78rem' : '0.9rem'
            }}
          >
            <Power size={18} />
            {connected ? 'DISCONNECT' : 'CONNECT'}
          </button>
        </div>
      </header>

      <div style={{
        flex: 1,
        padding: '0 10px 10px 10px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : `${leftSidebarOpen ? '300px' : '0px'} 1fr ${rightSidebarOpen ? '280px' : '0px'}`,
        gap: (leftSidebarOpen || rightSidebarOpen) ? '10px' : '0',
        minHeight: 0,
        overflowY: isMobile ? 'auto' : 'hidden',
        transition: 'grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <aside style={{
          display: isMobile ? (leftSidebarOpen ? 'block' : 'none') : 'block',
          order: isMobile ? 2 : 0,
          minHeight: 0,
          overflow: 'hidden',
          opacity: leftSidebarOpen ? 1 : 0,
          transition: 'opacity 0.2s',
          pointerEvents: leftSidebarOpen ? 'auto' : 'none'
        }}>
          <CommandGuide onSelect={handleCommand} />
        </aside>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '15px', minHeight: 0, order: isMobile ? 1 : 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
              <TerminalIcon size={18} color="var(--accent)" />
              <h2 style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '1px' }}>SYSTEM TERMINAL</h2>
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
              <TerminalComponent onCommand={handleCommand} incomingData={incomingData} theme={theme} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>AUTOMATED MACROS</h3>
            <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
              <button
                disabled={!connected || isExecuting}
                onClick={() => runMacro(["scanap", "stopscan", "listap"])}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--panel-border)',
                  color: 'white',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  cursor: connected ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: connected ? 1 : 0.5,
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center'
                }}
              >
                <Play size={14} fill="currentColor" /> Full Recon
              </button>
              <button
                disabled={!connected || isExecuting}
                onClick={() => runMacro(["scanap", "stopscan", "select -a 0", "attack -t deauth"])}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--panel-border)',
                  color: 'white',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  cursor: connected ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: connected ? 1 : 0.5,
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center'
                }}
              >
                <Play size={14} fill="currentColor" /> Targeted Attack
              </button>
            </div>
          </div>
        </section>

        <aside style={{
          display: isMobile ? (rightSidebarOpen ? 'flex' : 'none') : 'flex',
          order: isMobile ? 3 : 0,
          flexDirection: 'column',
          gap: '15px',
          overflow: 'hidden',
          opacity: rightSidebarOpen ? 1 : 0,
          transition: 'opacity 0.2s',
          pointerEvents: rightSidebarOpen ? 'auto' : 'none'
        }}>
          <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--panel-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <Cpu size={20} color="var(--accent)" />
              <h2 style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '1px' }}>HARDWARE STATUS</h2>
            </div>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid rgba(0,255,156,0.1)'
            }}>
              <pre style={{ fontSize: '0.8rem', color: 'var(--green)', whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'JetBrains Mono' }}>
                {deviceInfo}
              </pre>
            </div>
            {error && (
              <div style={{ marginTop: '15px', color: '#ff4b4b', fontSize: '0.75rem', background: 'rgba(255,75,75,0.1)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,75,75,0.2)' }}>
                {error}
              </div>
            )}
          </div>

          <div style={{ flex: 1, minHeight: isMobile ? '200px' : '150px' }}>
            <Visualizer />
          </div>

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>CONNECTION INFO</h3>
            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>STATUS:</span>
                <span style={{ color: connected ? 'var(--green)' : '#f44' }}>{connected ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>BAUD RATE:</span>
                <span>115200</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>BUFFER:</span>
                <span>OK</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer style={{ padding: '10px', textAlign: 'center', fontSize: isMobile ? '0.68rem' : '0.75rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
        ESP32 MARAUDER WEB CLI // VERSION 1.0 // Abhishek_Mainali
      </footer>
    </main>
  );
}
