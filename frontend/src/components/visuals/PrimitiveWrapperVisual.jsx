import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';

export default function PrimitiveWrapperVisual({ heapId, objDto }) {
  const valDto = objDto?.fields?.value;

  return (
    <div
      data-heap-card-id={heapId}
      style={{
        background: '#121826',
        borderRadius: '20px',
        border: '1px solid #6366f1',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
        padding: '4px 12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 600, fontFamily: 'monospace' }}>
        {cleanClassName(objDto.type)}:
      </span>
      <RenderValue valDto={valDto} sourceId={`${heapId}-val`} />
      <span style={{ fontSize: '9px', color: '#64748b', marginLeft: '4px' }}>({heapId})</span>
    </div>
  );
}
