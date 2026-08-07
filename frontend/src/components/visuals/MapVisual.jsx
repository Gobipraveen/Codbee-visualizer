import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { Map as MapIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export default function MapVisual({ heapId, objDto, isNested = false, depth = 0 }) {
  const elements = objDto?.elements || [];
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
        border: '1px solid #f59e0b',
        boxShadow: isNested ? 'none' : '0 4px 10px rgba(245, 158, 11, 0.15)',
        padding: isNested ? '4px 6px' : '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        minWidth: isNested ? '140px' : '180px',
        maxWidth: isNested ? '100%' : '320px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <MapIcon size={12} color="#f59e0b" />
          <span style={{ fontWeight: 600, color: '#fbbf24', fontSize: '11px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto?.type || 'Map')}
          </span>
        </div>
      </div>

      {/* Unified Key -> Value Pair Rows inside One Bordered Container */}
      {elements.length === 0 ? (
        <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', padding: '4px 0' }}>empty map</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: '#0f172a', borderRadius: '5px', padding: '4px', border: '1px solid #1e293b' }}>
          {elements.map((pair, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#1e293b',
                borderRadius: '4px',
                padding: '4px 6px',
                fontSize: '11px',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              {/* Key cell */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RenderValue valDto={pair?.key} sourceId={`${heapId}-map-k-${idx}`} depth={depth} />
              </div>

              <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '10px', margin: '0 2px' }}>→</span>

              {/* Value cell */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RenderValue valDto={pair?.value} sourceId={`${heapId}-map-v-${idx}`} depth={depth} />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
