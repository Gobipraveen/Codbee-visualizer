import React, { useRef, useEffect, useState } from 'react';
import { Layers, ArrowRight, CornerDownRight, CheckCircle2 } from 'lucide-react';
import { RenderValue, cleanClassName } from './visuals/RenderValue';

// Helper to format method signature with parameter values (e.g., fib(n=3))
function formatMethodSignature(frame) {
  const className = cleanClassName(frame.className);
  const methodName = frame.methodName;
  const vars = frame.variables || {};

  const argPairs = Object.entries(vars).map(([name, valDto]) => {
    let valText = 'null';
    if (valDto?.type === 'primitive') valText = String(valDto.value);
    else if (valDto?.type === 'string') valText = `"${valDto.value}"`;
    else if (valDto?.type === 'reference') valText = String(valDto.value);
    return `${name}=${valText}`;
  });

  const shortArgs = argPairs.slice(0, 3).join(', ') + (argPairs.length > 3 ? '…' : '');

  return {
    className,
    methodName,
    signature: `${methodName}(${shortArgs})`,
    fullSignature: `${className}.${methodName}(${argPairs.join(', ')})`,
  };
}

export default function RecursiveCallStack({ stack = [] }) {
  const containerRef = useRef(null);
  const activeFrameRef = useRef(null);
  const prevStackRef = useRef([]);
  const [poppedNotice, setPoppedNotice] = useState(null);

  // Detect popped frames (returns) across step navigation
  useEffect(() => {
    const prevStack = prevStackRef.current;
    if (prevStack.length > stack.length && prevStack.length > 0) {
      const poppedFrame = prevStack[0];
      const sig = formatMethodSignature(poppedFrame);
      setPoppedNotice({
        message: `${sig.signature} completed & returned`,
        id: Date.now(),
      });
      const timer = setTimeout(() => setPoppedNotice(null), 3000);
      return () => clearTimeout(timer);
    }
    prevStackRef.current = stack;
  }, [stack]);

  // Auto-scroll active (top) frame into view
  useEffect(() => {
    if (activeFrameRef.current) {
      activeFrameRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [stack]);

  const totalFrames = stack.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div style={panelHeaderStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={15} color="#3b82f6" />
          <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '13px' }}>Call Stack</span>
        </div>
        <span style={{ fontSize: '10px', color: '#93c5fd', background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
          {totalFrames} {totalFrames === 1 ? 'frame' : 'frames'}
        </span>
      </div>

      {/* Popped Frame Return Notification */}
      {poppedNotice && (
        <div
          style={{
            margin: '0 0 8px 0',
            padding: '6px 10px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '6px',
            color: '#34d399',
            fontSize: '11px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          <CheckCircle2 size={13} color="#34d399" />
          <span>{poppedNotice.message}</span>
        </div>
      )}

      {/* Cascading Stack Frames Container */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '4px',
        }}
      >
        {totalFrames === 0 ? (
          <div style={emptyTextStyle}>No active call frames</div>
        ) : (
          stack.map((frame, idx) => {
            const isActive = idx === 0;
            const depth = totalFrames - 1 - idx; // 0 = main, 1 = fib(3), 2 = fib(2)...
            const indentPx = Math.min(depth * 14, 110); // cap max indent
            const sigInfo = formatMethodSignature(frame);

            return (
              <div
                key={`${frame.className}-${frame.methodName}-${frame.line}-${idx}`}
                ref={isActive ? activeFrameRef : null}
                style={{
                  marginLeft: `${indentPx}px`,
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                }}
              >
                {/* Visual Tree Line Connector for nested calls */}
                {depth > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '-10px',
                      top: '12px',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <CornerDownRight size={10} color="#475569" />
                  </div>
                )}

                {/* Frame Card Box */}
                <div
                  style={{
                    background: isActive ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : '#111827',
                    borderRadius: '8px',
                    border: isActive ? '1px solid #3b82f6' : '1px solid #1e293b',
                    boxShadow: isActive
                      ? '0 0 16px rgba(59, 130, 246, 0.25), 0 4px 12px rgba(0,0,0,0.3)'
                      : '0 2px 6px rgba(0, 0, 0, 0.2)',
                    padding: '8px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  {/* Card Header: Method Signature & Line Number */}
                  <div
                    style={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid #1e293b',
                      paddingBottom: '5px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: isActive ? '#60a5fa' : '#94a3b8',
                          fontSize: '12px',
                          fontFamily: "'Fira Code', monospace",
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                        }}
                        title={sigInfo.fullSignature}
                      >
                        {sigInfo.signature}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {isActive ? (
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            color: '#3b82f6',
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            letterSpacing: '0.5px',
                          }}
                        >
                          ACTIVE
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '9px',
                            color: '#64748b',
                            background: '#0f172a',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                          }}
                        >
                          depth {depth}
                        </span>
                      )}
                      <span style={{ fontSize: '10px', color: '#94a3b8', background: '#0f172a', padding: '1px 6px', borderRadius: '4px' }}>
                        line {frame.line}
                      </span>
                    </div>
                  </div>

                  {/* Variables Table inside Frame */}
                  {Object.keys(frame.variables || {}).length === 0 ? (
                    <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>no local variables</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <tbody>
                        {Object.entries(frame.variables || {}).map(([varName, valDto]) => (
                          <tr key={varName} style={{ borderBottom: '1px dotted #1e293b' }}>
                            <td style={{ padding: '2px 0', color: '#cbd5e1', fontFamily: "'Fira Code', monospace", fontWeight: 500 }}>
                              {varName}
                            </td>
                            <td style={{ padding: '2px 0', textAlign: 'right' }}>
                              <RenderValue valDto={valDto} sourceId={`stack-${idx}-${varName}`} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const panelHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '8px',
  marginBottom: '8px',
  borderBottom: '1px solid #1e293b',
};

const emptyTextStyle = {
  fontSize: '12px',
  color: '#64748b',
  fontStyle: 'italic',
  textAlign: 'center',
  padding: '20px 0',
};
