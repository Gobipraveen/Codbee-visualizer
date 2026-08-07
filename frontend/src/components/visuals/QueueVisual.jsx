import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export default function QueueVisual({ heapId, objDto, isNested = false, depth = 0 }) {
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
        border: '1px solid #a855f7',
        boxShadow: isNested ? 'none' : '0 4px 12px rgba(168, 85, 247, 0.15)',
        padding: isNested ? '6px 8px' : '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: isNested ? '180px' : '220px',
        maxWidth: isNested ? '100%' : '340px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowRightLeft size={13} color="#a855f7" />
          <span style={{ fontWeight: 600, color: '#c084fc', fontSize: '11px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto?.type || 'Queue')}
          </span>
        </div>
      </div>

      {/* Queue Tube */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#0f172a', borderTop: '2px solid #a855f7', borderBottom: '2px solid #a855f7', padding: '6px 8px', borderRadius: '6px' }}>
        <span style={{ fontSize: '9px', fontWeight: 700, color: '#c084fc', marginRight: '4px' }}>FRONT →</span>

        {elements.length === 0 ? (
          <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', flex: 1, textAlign: 'center' }}>empty queue</span>
        ) : (
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', flex: 1 }}>
            <AnimatePresence mode="popLayout">
              {elements.map((elemVal, idx) => (
                <motion.div
                  key={`q-${idx}-${JSON.stringify(elemVal?.value ?? idx)}`}
                  initial={{ opacity: 0, x: -10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.85 }}
                  transition={{ duration, ease: 'easeOut' }}
                  style={{
                    background: idx === 0 ? 'rgba(168, 85, 247, 0.2)' : '#1e293b',
                    border: idx === 0 ? '1px solid #a855f7' : '1px solid #334155',
                    borderRadius: '4px',
                    padding: '4px 6px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <RenderValue valDto={elemVal} sourceId={`${heapId}-q-${idx}`} depth={depth} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <span style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', marginLeft: '4px' }}>← REAR</span>
      </div>
    </motion.div>
  );
}
