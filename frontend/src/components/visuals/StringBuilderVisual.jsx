import React from 'react';
import { cleanClassName } from './RenderValue';
import { Type } from 'lucide-react';

export default function StringBuilderVisual({ heapId, objDto }) {
  const elements = objDto?.elements || [];
  let textStr = '';
  if (elements.length > 0) {
    const first = elements[0];
    textStr = (first && typeof first === 'object' && first.value !== undefined) ? String(first.value) : String(first || '');
  } else if (objDto?.fields?.value?.value !== undefined) {
    textStr = String(objDto.fields.value.value);
  } else if (objDto?.value !== undefined) {
    textStr = String(objDto.value);
  }

  const charList = textStr.split('');

  return (
    <div
      data-heap-card-id={heapId}
      style={{
        background: '#121826',
        borderRadius: '8px',
        border: '1px solid #ec4899',
        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.15)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '200px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Type size={14} color="#ec4899" />
          <span style={{ fontWeight: 600, color: '#f472b6', fontSize: '12px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto.type)}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8', background: '#0f172a', padding: '1px 6px', borderRadius: '4px' }}>
          len={charList.length}
        </span>
      </div>

      {/* Scrabble Letter Blocks Sequence */}
      {charList.length === 0 ? (
        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>&ldquo;&rdquo; (empty)</div>
      ) : (
        <div style={{ display: 'flex', gap: '3px', overflowX: 'auto', paddingBottom: '2px' }}>
          {charList.map((ch, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '24px',
                height: '28px',
                background: '#831843',
                border: '1px solid #ec4899',
                borderRadius: '4px',
                color: '#fbcfe8',
                fontFamily: "'Fira Code', monospace",
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}
            >
              {ch}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
