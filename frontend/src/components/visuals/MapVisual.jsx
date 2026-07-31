import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { Map as MapIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export default function MapVisual({ heapId, objDto }) {
  const elements = objDto?.elements || [];
  const { duration } = useAnimationSettings();

  return (
    <motion.div
      data-heap-card-id={heapId}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration, ease: 'easeOut' }}
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
          <MapIcon size={14} color="#f59e0b" />
          <span style={{ fontWeight: 600, color: '#fbbf24', fontSize: '12px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto.type)}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8', background: '#0f172a', padding: '1px 6px', borderRadius: '4px' }}>
          {heapId}
        </span>
      </div>

      {/* Key -> Value Table */}
      {elements.length === 0 ? (
        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>empty map</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>
              <th style={{ padding: '2px 0', textAlign: 'left' }}>Key</th>
              <th style={{ padding: '2px 0', textAlign: 'right' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {elements.map((pair, idx) => (
              <tr key={idx} style={{ borderBottom: '1px dotted #1e293b' }}>
                <td style={{ padding: '4px 0', textAlign: 'left' }}>
                  <RenderValue valDto={pair?.key} sourceId={`${heapId}-map-k-${idx}`} />
                </td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>
                  <RenderValue valDto={pair?.value} sourceId={`${heapId}-map-v-${idx}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  );
}
