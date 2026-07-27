import React, { useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';

export default function StdoutConsole({ stdout }) {
  const consoleRef = useRef(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [stdout]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(32, 34, 44, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.09)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '11px',
        fontWeight: 600,
        color: '#e2e8f0',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        fontFamily: 'var(--font-mac)'
      }}>
        <Terminal size={14} color="#ffd60a" />
        <span>Standard Output (stdout)</span>
      </div>
      <div
        ref={consoleRef}
        style={{
          flex: 1,
          padding: '14px',
          fontFamily: "var(--font-mono)",
          fontSize: '12.5px',
          color: '#30d158',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowY: 'auto',
          background: 'rgba(18, 19, 25, 0.9)'
        }}
      >
        {stdout && stdout.trim() ? stdout : <span style={{ color: '#64748b', fontStyle: 'italic', fontFamily: 'var(--font-mac)' }}>No output generated yet</span>}
      </div>
    </div>
  );
}
