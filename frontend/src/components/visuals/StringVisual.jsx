import React from 'react';
import { cleanClassName } from './RenderValue';
import { Type } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export default function StringVisual({ heapId, objDto }) {
  const textVal = objDto?.fields?.value?.value || objDto?.value || '';
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
        border: '1px solid #eab308',
        boxShadow: '0 4px 12px rgba(234, 179, 8, 0.15)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        minWidth: '160px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Type size={14} color="#eab308" />
          <span style={{ fontWeight: 600, color: '#fde047', fontSize: '12px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto.type)}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8', background: '#0f172a', padding: '1px 6px', borderRadius: '4px' }}>
          {heapId}
        </span>
      </div>

      {/* String Value */}
      <div style={{ color: '#fde047', fontFamily: 'monospace', fontSize: '13px', padding: '4px 0', wordBreak: 'break-all' }}>
        &ldquo;{String(textVal)}&rdquo;
      </div>
    </motion.div>
  );
}
