import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { Network } from 'lucide-react';

export default function MapVisual({ heapId, objDto }) {
  const elements = objDto?.elements || [];

  return (
    <div
      data-heap-card-id={heapId}
      style={{
        background: '#121826',
        borderRadius: '8px',
        border: '1px solid #f59e0b',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
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
          <Network size={14} color="#f59e0b" />
          <span style={{ fontWeight: 600, color: '#fbbf24', fontSize: '12px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto.type)}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8', background: '#0f172a', padding: '1px 6px', borderRadius: '4px' }}>
          {heapId}
        </span>
      </div>

      {/* Entry Key → Value Table */}
      {elements.length === 0 ? (
        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>empty map</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', fontSize: '9px', textTransform: 'uppercase' }}>
              <th style={{ textAlign: 'left', paddingBottom: '4px', fontWeight: 600 }}>Key</th>
              <th style={{ textAlign: 'center', paddingBottom: '4px', width: '20px' }}>→</th>
              <th style={{ textAlign: 'right', paddingBottom: '4px', fontWeight: 600 }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {elements.map((entry, idx) => (
              <tr key={idx} style={{ borderBottom: '1px dotted #1e293b' }}>
                <td style={{ padding: '4px 0', verticalAlign: 'middle' }}>
                  <RenderValue valDto={entry.key} sourceId={`${heapId}-mapk-${idx}`} />
                </td>
                <td style={{ color: '#f59e0b', fontSize: '11px', textAlign: 'center', opacity: 0.7 }}>→</td>
                <td style={{ padding: '4px 0', textAlign: 'right', verticalAlign: 'middle' }}>
                  <RenderValue valDto={entry.value} sourceId={`${heapId}-mapv-${idx}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
