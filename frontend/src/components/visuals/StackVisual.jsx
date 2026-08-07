import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export default function StackVisual({ heapId, objDto, isNested = false, depth = 0 }) {
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
        border: '1px solid #f97316',
        boxShadow: isNested ? 'none' : '0 4px 10px rgba(249, 115, 22, 0.15)',
        padding: isNested ? '4px 6px' : '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        minWidth: isNested ? '130px' : '150px',
        maxWidth: isNested ? '100%' : '260px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Layers size={12} color="#f97316" />
          <span style={{ fontWeight: 600, color: '#fb923c', fontSize: '11px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto?.type || 'Stack')}
          </span>
        </div>
      </div>

      {/* Single Vertical Container with nested rows */}
      {elements.length === 0 ? (
        <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', padding: '4px 0' }}>empty stack</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', borderLeft: '2px solid #f97316', borderRight: '2px solid #f97316', borderBottom: '2px solid #f97316', padding: '4px', borderRadius: '0 0 5px 5px', background: '#0f172a' }}>
          <AnimatePresence mode="popLayout">
            {[...elements].reverse().map((elemVal, revIdx) => {
              const isTop = revIdx === 0;
              const originalIdx = elements.length - 1 - revIdx;
              return (
                <motion.div
                  key={`stk-${originalIdx}`}
                  initial={{ opacity: 0, y: -10, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.88 }}
                  transition={{ duration, ease: 'easeOut' }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: isTop ? 'rgba(249, 115, 22, 0.18)' : '#1e293b',
                    border: isTop ? '1px solid #f97316' : '1px solid #334155',
                    borderRadius: '4px',
                    padding: '3px 6px',
                    position: 'relative',
                    gap: '6px',
                  }}
                >
                  <RenderValue valDto={elemVal} sourceId={`${heapId}-stk-${originalIdx}`} depth={depth} />
                  {isTop && (
                    <span style={{ fontSize: '8px', fontWeight: 800, color: '#f97316', background: 'rgba(249, 115, 22, 0.25)', padding: '1px 3px', borderRadius: '3px', letterSpacing: '0.5px' }}>
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
