import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export default function StackVisual({ heapId, objDto }) {
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
        border: '1px solid #f97316',
        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.15)',
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
          <Layers size={14} color="#f97316" />
          <span style={{ fontWeight: 600, color: '#fb923c', fontSize: '12px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto.type)}
          </span>
        </div>
      </div>

      {/* Stack Items */}
      {elements.length === 0 ? (
        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', padding: '6px 0' }}>empty stack</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '2px solid #f97316', borderRight: '2px solid #f97316', borderBottom: '2px solid #f97316', padding: '6px', borderRadius: '0 0 6px 6px', background: '#0f172a' }}>
          <AnimatePresence mode="popLayout">
            {[...elements].reverse().map((elemVal, revIdx) => {
              const isTop = revIdx === 0;
              const originalIdx = elements.length - 1 - revIdx;
              return (
                <motion.div
                  key={`stk-${originalIdx}`}
                  initial={{ opacity: 0, y: -12, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.88 }}
                  transition={{ duration, ease: 'easeOut' }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: isTop ? 'rgba(249, 115, 22, 0.15)' : '#1e293b',
                    border: isTop ? '1px solid #f97316' : '1px solid #334155',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    position: 'relative',
                  }}
                >
                  <RenderValue valDto={elemVal} sourceId={`${heapId}-stk-${originalIdx}`} />
                  {isTop && (
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#f97316', background: 'rgba(249, 115, 22, 0.2)', padding: '1px 4px', borderRadius: '3px', letterSpacing: '0.5px' }}>
                      TOP
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
