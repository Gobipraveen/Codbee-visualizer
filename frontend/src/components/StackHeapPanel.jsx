import React, { useRef, useEffect } from 'react';
import { Layers, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HeapGraphSvgOverlay from './HeapGraphSvgOverlay';
import HeapCardFactory from './visuals/HeapCardFactory';
import { RenderValue, cleanClassName } from './visuals/RenderValue';
import { useAnimationSettings } from '../context/AnimationSettingsContext';

// ─── Color Palette per Depth ──────────────────────────────────────────────────

const DEPTH_THEMES = [
  { border: '#3b82f6', headerBg: 'rgba(59, 130, 246, 0.15)', text: '#93c5fd', badgeBg: 'rgba(59, 130, 246, 0.25)', badgeText: '#60a5fa' }, // Depth 0 (Blue)
  { border: '#06b6d4', headerBg: 'rgba(6, 182, 212, 0.15)', text: '#67e8f9', badgeBg: 'rgba(6, 182, 212, 0.25)', badgeText: '#22d3ee' },  // Depth 1 (Cyan)
  { border: '#10b981', headerBg: 'rgba(16, 185, 129, 0.15)', text: '#6ee7b7', badgeBg: 'rgba(16, 185, 129, 0.25)', badgeText: '#34d399' }, // Depth 2 (Green)
  { border: '#f59e0b', headerBg: 'rgba(245, 158, 11, 0.15)', text: '#fde047', badgeBg: 'rgba(245, 158, 11, 0.25)', badgeText: '#fbbf24' }, // Depth 3 (Amber)
  { border: '#a855f7', headerBg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', badgeBg: 'rgba(168, 85, 247, 0.25)', badgeText: '#c084fc' }, // Depth 4 (Purple)
  { border: '#ec4899', headerBg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', badgeBg: 'rgba(236, 72, 153, 0.25)', badgeText: '#f472b6' }, // Depth 5+ (Pink)
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

  // Check if primary heap type is linked list or doubly linked list to format horizontal row
  const hasLinkedList = containers.some(([_, obj]) => obj.visualType === 'linked_list' || obj.visualType === 'doubly_linked_list');

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '34% 66%',
        gap: '14px',
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
            <Layers size={15} color="#3b82f6" />
            <span>Call Stack</span>
          </div>
          {totalFrames > 0 && (
            <span style={{ fontSize: '10px', color: '#93c5fd', background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
              Depth: {totalFrames}
            </span>
          )}
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
                      background: '#121826',
                      borderRadius: '8px',
                      border: isTop ? `2px solid ${theme.border}` : `1px solid ${theme.border}`,
                      boxShadow: isTop ? `0 0 12px ${theme.border}33` : '0 2px 6px rgba(0,0,0,0.2)',
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
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
                            color: theme.text,
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
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.2)', padding: '1px 5px', borderRadius: '4px' }}>
                            TOP
                          </span>
                        )}
                        <span style={{ fontSize: '11px', color: '#94a3b8', background: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                          line {frame.line}
                        </span>
                      </div>
                    </div>

                    {/* Variables Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <tbody>
                        {Object.entries(frame.variables || {}).map(([varName, valDto]) => (
                          <tr key={varName} style={{ borderBottom: '1px dotted #1e293b' }}>
                            <td style={{ padding: '3px 0', color: '#cbd5e1', fontFamily: 'monospace', fontWeight: 500 }}>
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

      {/* ── Heap Panel (Efficient Compact Grid & Flow Layout) ── */}
      <div style={panelCardStyle}>
        <div style={panelHeaderStyle}>
          <Database size={15} color="#10b981" />
          <span>Heap Objects</span>
        </div>

        {Object.keys(heapMap).length === 0 ? (
          <div style={emptyTextStyle}>No heap objects allocated</div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: hasLinkedList ? 'row' : 'row',
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
  background: '#121826',
  borderRadius: '8px',
  border: '1px solid #1e293b',
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
  color: '#f8fafc',
  marginBottom: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  flexShrink: 0,
};

const emptyTextStyle = {
  fontSize: '12px',
  color: '#64748b',
  fontStyle: 'italic',
  textAlign: 'center',
  padding: '12px 0',
};
