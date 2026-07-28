import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { Box } from 'lucide-react';

export default function GenericObjectVisual({ heapId, objDto }) {
  const fields = objDto?.fields || {};

  return (
    <div
      data-heap-card-id={heapId}
      style={{
        background: '#121826',
        borderRadius: '8px',
        border: '1px solid #334155',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
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
          <Box size={14} color="#94a3b8" />
          <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '12px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto.type)}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8', background: '#0f172a', padding: '1px 6px', borderRadius: '4px' }}>
          {heapId}
        </span>
      </div>

      {/* Fields Table */}
      {Object.keys(fields).length === 0 ? (
        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>no fields</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <tbody>
            {Object.entries(fields).map(([fieldName, valDto]) => (
              <tr key={fieldName} style={{ borderBottom: '1px dotted #1e293b' }}>
                <td style={{ padding: '3px 0', color: '#cbd5e1', fontFamily: 'monospace', fontWeight: 500 }}>
                  {fieldName}
                </td>
                <td style={{ padding: '3px 0', textAlign: 'right' }}>
                  <RenderValue valDto={valDto} sourceId={`${heapId}-${fieldName}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
