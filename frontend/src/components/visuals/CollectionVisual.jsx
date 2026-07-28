import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { ListFilter, Hash } from 'lucide-react';

export default function CollectionVisual({ heapId, objDto }) {
  const isSet = objDto.visualType === 'set';
  const elements = objDto?.elements || [];

  return (
    <div
      data-heap-card-id={heapId}
      style={{
        background: '#121826',
        borderRadius: '8px',
        border: isSet ? '1px dashed #14b8a6' : '1px solid #14b8a6',
        boxShadow: '0 4px 12px rgba(20, 184, 166, 0.15)',
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
          {isSet ? <Hash size={14} color="#14b8a6" /> : <ListFilter size={14} color="#14b8a6" />}
          <span style={{ fontWeight: 600, color: '#2dd4bf', fontSize: '12px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto.type)}
          </span>
          {isSet && (
            <span style={{ fontSize: '9px', fontWeight: 600, color: '#14b8a6', background: 'rgba(20, 184, 166, 0.15)', padding: '1px 5px', borderRadius: '4px' }}>
              unique
            </span>
          )}
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8', background: '#0f172a', padding: '1px 6px', borderRadius: '4px' }}>
          {heapId}
        </span>
      </div>

      {/* Chip / Pill Array */}
      {elements.length === 0 ? (
        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>empty {isSet ? 'set' : 'list'}</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '4px 0' }}>
          {elements.map((elemVal, idx) => (
            <div
              key={idx}
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: isSet ? '16px' : '6px', // Rounded pills for set, rounded rect for list
                padding: '3px 8px',
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <RenderValue valDto={elemVal} sourceId={`${heapId}-col-${idx}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
