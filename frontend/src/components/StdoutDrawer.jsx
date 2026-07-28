import React, { useState, useRef, useEffect } from 'react';
import { Terminal, ChevronUp, ChevronDown, GripHorizontal } from 'lucide-react';

export default function StdoutDrawer({ stdout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(160);
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(160);
  const consoleRef = useRef(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (isOpen && consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [stdout, isOpen]);

  // Handle drag resize
  const handleMouseDown = (e) => {
    if (!isOpen) return;
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const deltaY = startYRef.current - e.clientY;
      const newHeight = Math.min(450, Math.max(90, startHeightRef.current + deltaY));
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  // Extract last line for collapsed preview
  const lastLine = stdout
    ? stdout.trim().split('\n').filter(Boolean).pop() || ''
    : '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: isOpen ? `${height}px` : '36px',
        background: '#121826',
        borderTop: '1px solid #1e293b',
        transition: isResizing ? 'none' : 'height 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 40,
        position: 'relative',
      }}
    >
      {/* Top Drag Handle (Active when open) */}
      {isOpen && (
        <div
          onMouseDown={handleMouseDown}
          title="Drag to resize drawer"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            cursor: 'ns-resize',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        />
      )}

      {/* Drawer Header Strip */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          height: '36px',
          padding: '0 16px',
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          borderBottom: isOpen ? '1px solid #1e293b' : 'none',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <Terminal size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase', flexShrink: 0 }}>
            stdout
          </span>

          {/* Collapsed preview */}
          {!isOpen && (
            <span
              style={{
                fontSize: '12px',
                fontFamily: "'Fira Code', monospace",
                color: lastLine ? '#34d399' : '#475569',
                marginLeft: '12px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {lastLine ? lastLine : 'No output'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isOpen && <GripHorizontal size={14} color="#475569" title="Drag top edge to resize" />}
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Terminal Console Output */}
      {isOpen && (
        <div
          ref={consoleRef}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontFamily: "'Fira Code', monospace",
            fontSize: '13px',
            color: '#34d399',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowY: 'auto',
            background: '#090d16',
          }}
        >
          {stdout && stdout.trim() ? stdout : <span style={{ color: '#475569', fontStyle: 'italic' }}>No output generated yet</span>}
        </div>
      )}
    </div>
  );
}
