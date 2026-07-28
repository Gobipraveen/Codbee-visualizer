import React from 'react';
import { cleanClassName } from './RenderValue';
import { Quote } from 'lucide-react';

export default function StringVisual({ heapId, objDto }) {
  const textStr = objDto?.value || '';

  return (
    <div
      data-heap-card-id={heapId}
      style={{
        background: '#121826',
        borderRadius: '8px',
        border: '1px solid #eab308',
        boxShadow: '0 4px 12px rgba(234, 179, 8, 0.15)',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        maxWidth: '280px',
      }}
    >
      <Quote size={13} color="#eab308" style={{ flexShrink: 0 }} />
      <span style={{ fontSize: '13px', color: '#fde047', fontFamily: "'Fira Code', monospace", wordBreak: 'break-all' }}>
        &ldquo;{String(textStr)}&rdquo;
      </span>
      <span style={{ fontSize: '9px', color: '#94a3b8', background: '#0f172a', padding: '1px 5px', borderRadius: '4px', marginLeft: 'auto', flexShrink: 0 }}>
        {heapId}
      </span>
    </div>
  );
}
