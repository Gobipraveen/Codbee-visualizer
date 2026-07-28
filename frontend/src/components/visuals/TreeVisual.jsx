import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { GitFork } from 'lucide-react';

export default function TreeVisual({ heapId, objDto }) {
  const fields = objDto?.fields || {};
  const valDto = fields.val || fields.value || fields.data || fields.key;
  const leftDto = fields.left;
  const rightDto = fields.right;

  return (
    <div
      data-heap-card-id={heapId}
      style={{
        background: '#121826',
        borderRadius: '8px',
        border: '1px solid #06b6d4',
        boxShadow: '0 4px 12px rgba(6, 182, 212, 0.15)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '190px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GitFork size={14} color="#06b6d4" />
          <span style={{ fontWeight: 600, color: '#22d3ee', fontSize: '12px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto.type)}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8', background: '#0f172a', padding: '1px 6px', borderRadius: '4px' }}>
          {heapId}
        </span>
      </div>

      {/* Value */}
      <div style={{ background: '#0f172a', borderRadius: '6px', padding: '6px 8px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>val</span>
        <RenderValue valDto={valDto} sourceId={`${heapId}-val`} />
      </div>

      {/* Children branches (left | right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        <div style={{ background: '#0f172a', padding: '4px 6px', borderRadius: '4px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 600 }}>← left</span>
          <div style={{ marginTop: '2px' }}>
            <RenderValue valDto={leftDto} sourceId={`${heapId}-left`} />
          </div>
        </div>
        <div style={{ background: '#0f172a', padding: '4px 6px', borderRadius: '4px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 600 }}>right →</span>
          <div style={{ marginTop: '2px' }}>
            <RenderValue valDto={rightDto} sourceId={`${heapId}-right`} />
          </div>
        </div>
      </div>
    </div>
  );
}
