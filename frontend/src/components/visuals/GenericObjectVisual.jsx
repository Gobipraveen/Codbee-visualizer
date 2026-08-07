import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { Box } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export default function GenericObjectVisual({ heapId, objDto, isNested = false, depth = 0 }) {
  const fields = objDto?.fields || {};
  const { duration } = useAnimationSettings();

  return (
    <motion.div
      data-heap-card-id={isNested ? undefined : heapId}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration, ease: 'easeOut' }}
      style={{
        background: '#121826',
        borderRadius: '8px',
        border: '1px solid #334155',
        boxShadow: isNested ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.2)',
        padding: isNested ? '4px 6px' : '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        minWidth: isNested ? '130px' : '180px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Box size={13} color="#94a3b8" />
          <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '11px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto?.type || 'Object')}
          </span>
        </div>
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
                  <RenderValue valDto={valDto} sourceId={`${heapId}-${fieldName}`} depth={depth} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  );
}
