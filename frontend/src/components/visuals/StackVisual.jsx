import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { Layers } from 'lucide-react';

export default function StackVisual({ heapId, objDto }) {
  const elements = objDto?.elements || [];

  return (
    <div
      data-heap-card-id={heapId}
      style={{
        background: '#121826',
        borderRadius: '8px',
        border: '1px solid #f97316',
        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.15)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '180px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} color="#f97316" />
          <span style={{ fontWeight: 600, color: '#fb923c', fontSize: '12px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto.type)}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8', background: '#0f172a', padding: '1px 6px', borderRadius: '4px' }}>
          {heapId}
        </span>
      </div>

      {/* Stack Items (Stacked Bottom-to-Top: reverse elements so TOP is at top of UI) */}
      {elements.length === 0 ? (
        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', padding: '6px 0' }}>empty stack</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '2px solid #f97316', borderRight: '2px solid #f97316', borderBottom: '2px solid #f97316', padding: '6px', borderRadius: '0 0 6px 6px', background: '#0f172a' }}>
          {[...elements].reverse().map((elemVal, revIdx) => {
            const isTop = revIdx === 0;
            const originalIdx = elements.length - 1 - revIdx;
            return (
              <div
                key={revIdx}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  background: isTop ? 'rgba(249, 115, 22, 0.15)' : '#1e293b',
                  border: isTop ? '1px solid #f97316' : '1px solid #334155',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  position: 'relative',
                }}
              >
                <RenderValue valDto={elemVal} sourceId={`${heapId}-stk-${originalIdx}`} />
                {isTop && (
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#f97316', background: 'rgba(249, 115, 22, 0.2)', padding: '1px 4px', borderRadius: '3px', letterSpacing: '0.5px' }}>
                    TOP
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
