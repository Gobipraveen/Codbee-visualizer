import React, { useRef, useEffect, useState } from 'react';
import { Layers, Database, Columns, Rows } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HeapGraphSvgOverlay from './HeapGraphSvgOverlay';
import HeapCardFactory from './visuals/HeapCardFactory';
import { RenderValue, cleanClassName } from './visuals/RenderValue';
import { useAnimationSettings } from '../context/AnimationSettingsContext';

// ─── Color Palette per Depth ──────────────────────────────────────────────────

const DEPTH_THEMES = [
  { border: '#3b82f6', headerBg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', badgeBg: 'rgba(59, 130, 246, 0.25)', badgeText: '#2563eb' }, // Depth 0 (Blue)
  { border: '#06b6d4', headerBg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', badgeBg: 'rgba(6, 182, 212, 0.25)', badgeText: '#0891b2' },  // Depth 1 (Cyan)
  { border: '#10b981', headerBg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', badgeBg: 'rgba(16, 185, 129, 0.25)', badgeText: '#059669' }, // Depth 2 (Green)
  { border: '#f59e0b', headerBg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', badgeBg: 'rgba(245, 158, 11, 0.25)', badgeText: '#d97706' }, // Depth 3 (Amber)
  { border: '#a855f7', headerBg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', badgeBg: 'rgba(168, 85, 247, 0.25)', badgeText: '#9333ea' }, // Depth 4 (Purple)
  { border: '#ec4899', headerBg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', badgeBg: 'rgba(236, 72, 153, 0.25)', badgeText: '#db2777' }, // Depth 5+ (Pink)
];

function getDepthTheme(depth) {
  return DEPTH_THEMES[Math.min(depth, DEPTH_THEMES.length - 1)];
}

// ─── Format Method Name + Arguments Header ────────────────────────────────────

function formatMethodCallHeader(frame) {
  const methodName = frame.methodName || 'method';
  const variables = frame.variables || {};
  const argList = [];

  for (const [varName, valDto] of Object.entries(variables)) {
    let valStr = '';
    if (valDto?.type === 'primitive') {
      valStr = String(valDto.value);
    } else if (valDto?.type === 'string') {
      valStr = `"${valDto.value}"`;
    } else if (valDto?.type === 'reference') {
      valStr = String(valDto.value);
    } else if (valDto?.type === 'null') {
      valStr = 'null';
    } else {
      valStr = String(valDto?.value ?? '');
    }
    argList.push(`${varName}=${valStr}`);
  }

  const argsFormatted = argList.length > 0 ? argList.join(', ') : '';
  return `${cleanClassName(frame.className)}.${methodName}(${argsFormatted})`;
}

// ─── Main Panel ─────────────────────────────────────────────────────────────

export default function StackHeapPanel({ stepData }) {
  const containerRef = useRef(null);
  const activeFrameRef = useRef(null);
  const stack = stepData?.stack || [];
  const heapMap = stepData?.heap || {};
  const { duration } = useAnimationSettings();

  // Layout Ratio & Orientation State (Persisted in localStorage)
  const [stackRatio, setStackRatio] = useState(() => {
    const saved = localStorage.getItem('codbee_stack_ratio');
    return saved ? parseFloat(saved) : 34;
  });
  const [layoutMode, setLayoutMode] = useState(() => {
    const saved = localStorage.getItem('codbee_layout_mode');
    return saved || 'side-by-side';
  });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    localStorage.setItem('codbee_stack_ratio', stackRatio);
  }, [stackRatio]);

  useEffect(() => {
    localStorage.setItem('codbee_layout_mode', layoutMode);
  }, [layoutMode]);

  // Handle Drag Resizing of Stack/Heap Splitter Bar
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let newRatio = 34;
      if (layoutMode === 'side-by-side') {
        const mouseX = e.clientX - rect.left;
        newRatio = (mouseX / rect.width) * 100;
      } else {
        const mouseY = e.clientY - rect.top;
        newRatio = (mouseY / rect.height) * 100;
      }
      setStackRatio(Math.min(75, Math.max(15, newRatio)));
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
  }, [isResizing, layoutMode]);

  // Auto-scroll active (top) frame into view when step changes
  useEffect(() => {
    if (activeFrameRef.current) {
      activeFrameRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [stepData]);

  const totalFrames = stack.length;

  // Separate heap objects into Main Containers (Col 1) and Primitive Values (Col 2)
  const containers = [];
  const primitives = [];

  Object.entries(heapMap).forEach(([heapId, objDto]) => {
    const isPrim = objDto.visualType === 'primitive_wrapper' || objDto.visualType === 'string';
    if (isPrim) {
      primitives.push([heapId, objDto]);
    } else {
      containers.push([heapId, objDto]);
    }
  });

  const isSideBySide = layoutMode === 'side-by-side';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: isSideBySide ? `${stackRatio}% 6px 1fr` : '1fr',
        gridTemplateRows: isSideBySide ? '1fr' : `${stackRatio}% 6px 1fr`,
        gap: '0px',
        height: '100%',
        width: '100%',
        overflow: 'auto',
      }}
    >
      {/* SVG Arrow Overlay */}
      <HeapGraphSvgOverlay containerRef={containerRef} stepData={stepData} />

      {/* ── Stack Panel ── */}
      <div style={panelCardStyle}>
        <div style={panelHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={15} color="var(--primary)" />
            <span>Call Stack</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {totalFrames > 0 && (
              <span style={{ fontSize: '10px', color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                Depth: {totalFrames}
              </span>
            )}

            {/* Layout Mode Toggle Button */}
            <button
              onClick={() => setLayoutMode((m) => (m === 'side-by-side' ? 'top-bottom' : 'side-by-side'))}
              title={isSideBySide ? 'Switch to Top-Bottom Stacked Layout' : 'Switch to Side-by-Side Column Layout'}
              style={{
                background: 'var(--bg-cell)',
                border: '1px solid var(--bg-card-border)',
                color: 'var(--text-muted)',
                borderRadius: '4px',
                padding: '2px 6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '10px',
                fontWeight: 600,
              }}
            >
              {isSideBySide ? <Rows size={12} /> : <Columns size={12} />}
              <span>{isSideBySide ? 'Stack Top/Bottom' : 'Side-by-Side'}</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingRight: '2px', flex: 1 }}>
          {totalFrames === 0 ? (
            <div style={emptyTextStyle}>No active call frames</div>
          ) : (
            <AnimatePresence mode="sync">
              {stack.map((frame, idx) => {
                const isTop = idx === 0;
                const depth = totalFrames - 1 - idx;
                const theme = getDepthTheme(depth);
                const indentPx = Math.min(depth * 12, 60);

                return (
                  <motion.div
                    key={`frame-${depth}-${frame.methodName}`}
                    initial={{ opacity: 0, y: -12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.92 }}
                    transition={{ duration, ease: 'easeOut' }}
                    ref={isTop ? activeFrameRef : null}
                    style={{
                      marginLeft: `${indentPx}px`,
                      background: 'var(--bg-card)',
                      borderRadius: '8px',
                      border: isTop ? `2px solid ${theme.border}` : `1px solid ${theme.border}`,
                      boxShadow: isTop ? `0 0 12px ${theme.border}33` : '0 2px 6px rgba(0,0,0,0.1)',
                      padding: '8px 10px',
                      position: 'relative',
                    }}
                  >
                    {/* Cascading Connector for Nested Frames */}
                    {depth > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          left: '-10px',
                          top: '12px',
                          color: theme.border,
                          fontSize: '11px',
                          fontWeight: 'bold',
                          pointerEvents: 'none',
                          fontFamily: 'monospace',
                        }}
                      >
                        └──
                      </span>
                    )}

                    {/* Header Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            color: theme.badgeText,
                            background: theme.badgeBg,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            flexShrink: 0,
                          }}
                        >
                          #{depth}
                        </span>

                        <span
                          style={{
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={formatMethodCallHeader(frame)}
                        >
                          {formatMethodCallHeader(frame)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        {isTop && (
                          <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--primary)', background: 'rgba(56, 189, 248, 0.2)', padding: '1px 5px', borderRadius: '4px' }}>
                            TOP
                          </span>
                        )}
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-cell)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                          line {frame.line}
                        </span>
                      </div>
                    </div>

                    {/* Variables Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <tbody>
                        {Object.entries(frame.variables || {}).map(([varName, valDto]) => (
                          <tr key={varName} style={{ borderBottom: '1px dotted var(--bg-card-border)' }}>
                            <td style={{ padding: '3px 0', color: 'var(--text-main)', fontFamily: 'monospace', fontWeight: 500 }}>
                              {varName}
                            </td>
                            <td style={{ padding: '3px 0', textAlign: 'right' }}>
                              <RenderValue valDto={valDto} sourceId={`stack-${idx}-${varName}`} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Draggable Splitter Bar (Col Resizer / Row Resizer) ── */}
      <div
        onMouseDown={handleMouseDown}
        title={isSideBySide ? 'Drag to resize Call Stack width' : 'Drag to resize Call Stack height'}
        style={{
          width: isSideBySide ? '6px' : '100%',
          height: isSideBySide ? '100%' : '6px',
          background: isResizing ? 'var(--primary)' : 'var(--bg-card-border)',
          cursor: isSideBySide ? 'col-resize' : 'row-resize',
          zIndex: 20,
          transition: 'background 0.15s ease',
        }}
      />

      {/* ── Heap Panel (Efficient Compact Grid & Flow Layout) ── */}
      <div style={panelCardStyle}>
        <div style={panelHeaderStyle}>
          <Database size={15} color="var(--success)" />
          <span>Heap Objects</span>
        </div>

        {Object.keys(heapMap).length === 0 ? (
          <div style={emptyTextStyle}>No heap objects allocated</div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '16px 20px',
              alignItems: 'flex-start',
              alignContent: 'flex-start',
            }}
          >
            <AnimatePresence mode="popLayout">
              {containers.map(([heapId, objDto]) => (
                <motion.div
                  key={heapId}
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration, ease: 'easeOut' }}
                >
                  <HeapCardFactory heapId={heapId} objDto={objDto} />
                </motion.div>
              ))}

              {primitives.map(([heapId, objDto]) => (
                <motion.div
                  key={heapId}
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration, ease: 'easeOut' }}
                >
                  <HeapCardFactory heapId={heapId} objDto={objDto} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const panelCardStyle = {
  background: 'var(--bg-card)',
  borderRadius: '8px',
  border: '1px solid var(--bg-card-border)',
  padding: '12px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
};

const panelHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontWeight: 600,
  fontSize: '11px',
  color: 'var(--text-main)',
  marginBottom: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  flexShrink: 0,
};

const emptyTextStyle = {
  fontSize: '12px',
  color: 'var(--text-subtle)',
  fontStyle: 'italic',
  textAlign: 'center',
  padding: '12px 0',
};
