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
      background: '#121826',
      borderRadius: '8px',
      border: '1px solid #1e293b',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        fontSize: '12px',
        fontWeight: 600,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        <Terminal size={14} color="#f59e0b" />
        <span>Standard Output (stdout)</span>
      </div>
      <div
        ref={consoleRef}
        style={{
          flex: 1,
          padding: '12px',
          fontFamily: "'Fira Code', monospace",
          fontSize: '13px',
          color: '#34d399',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowY: 'auto',
          background: '#090d16'
        }}
      >
        {stdout && stdout.trim() ? stdout : <span style={{ color: '#475569', fontStyle: 'italic' }}>No output generated yet</span>}
      </div>
    </div>
  );
}
