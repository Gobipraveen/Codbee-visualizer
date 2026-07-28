import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { Box } from 'lucide-react';

export default function ArrayVisual({ heapId, objDto }) {
  const fields = objDto?.fields || {};
  const elements = objDto?.elements || [];

  // Determine items to render: use elements array if populated, else fields with "[0]", "[1]"
  const items = elements.length > 0
    ? elements.map((elem, idx) => ({ index: idx, valDto: elem }))
    : Object.entries(fields)
        .filter(([k]) => k.startsWith('[') && k.endsWith(']'))
        .map(([k, valDto]) => ({
          index: parseInt(k.replace('[', '').replace(']', ''), 10),
          valDto,
        }))
        .sort((a, b) => a.index - b.index);

  return (
    <div
      data-heap-card-id={heapId}
      style={{
        background: '#121826',
        borderRadius: '8px',
        border: '1px solid #3b82f6',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
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
          <Box size={14} color="#3b82f6" />
          <span style={{ fontWeight: 600, color: '#60a5fa', fontSize: '12px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto.type)}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8', background: '#0f172a', padding: '1px 6px', borderRadius: '4px' }}>
          {heapId}
        </span>
      </div>

      {/* Filmstrip Row of Cells */}
      {items.length === 0 ? (
        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>empty array</div>
      ) : (
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
          {items.map(({ index, valDto }) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '46px',
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                padding: '4px 6px',
              }}
            >
              {/* Index on top */}
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#64748b', marginBottom: '2px', fontFamily: 'monospace' }}>
                [{index}]
              </span>
              {/* Value inside */}
              <div style={{ fontSize: '12px' }}>
                <RenderValue valDto={valDto} sourceId={`${heapId}-idx-${index}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
