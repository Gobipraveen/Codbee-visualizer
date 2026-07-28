import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { ArrowRightLeft } from 'lucide-react';

export default function QueueVisual({ heapId, objDto }) {
  const elements = objDto?.elements || [];

  return (
    <div
      data-heap-card-id={heapId}
      style={{
        background: '#121826',
        borderRadius: '8px',
        border: '1px solid #a855f7',
        boxShadow: '0 4px 12px rgba(168, 85, 247, 0.15)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '220px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowRightLeft size={14} color="#a855f7" />
          <span style={{ fontWeight: 600, color: '#c084fc', fontSize: '12px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto.type)}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8', background: '#0f172a', padding: '1px 6px', borderRadius: '4px' }}>
          {heapId}
        </span>
      </div>

      {/* Queue Tube (Front on left, Rear on right) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#0f172a', borderTop: '2px solid #a855f7', borderBottom: '2px solid #a855f7', padding: '6px 8px', borderRadius: '6px' }}>
        <span style={{ fontSize: '9px', fontWeight: 700, color: '#c084fc', marginRight: '4px' }}>FRONT →</span>

        {elements.length === 0 ? (
          <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', flex: 1, textAlign: 'center' }}>empty queue</span>
        ) : (
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', flex: 1 }}>
            {elements.map((elemVal, idx) => (
              <div
                key={idx}
                style={{
                  background: idx === 0 ? 'rgba(168, 85, 247, 0.2)' : '#1e293b',
                  border: idx === 0 ? '1px solid #a855f7' : '1px solid #334155',
                  borderRadius: '4px',
                  padding: '4px 6px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                }}
              >
                <RenderValue valDto={elemVal} sourceId={`${heapId}-q-${idx}`} />
              </div>
            ))}
          </div>
        )}

        <span style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', marginLeft: '4px' }}>← REAR</span>
      </div>
    </div>
  );
}
