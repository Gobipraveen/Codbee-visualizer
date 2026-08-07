import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { ListFilter, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export default function CollectionVisual({ heapId, objDto, isNested = false, depth = 0 }) {
  const isSet = objDto?.visualType === 'set';
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
        border: isSet ? '1px dashed #14b8a6' : '1px solid #14b8a6',
        boxShadow: isNested ? 'none' : '0 4px 10px rgba(20, 184, 166, 0.15)',
        padding: isNested ? '4px 6px' : '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        minWidth: isNested ? '140px' : '160px',
        maxWidth: isNested ? '100%' : '320px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {isSet ? <Hash size={12} color="#14b8a6" /> : <ListFilter size={12} color="#14b8a6" />}
          <span style={{ fontWeight: 600, color: '#2dd4bf', fontSize: '11px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto?.type || (isSet ? 'Set' : 'List'))}
          </span>
        </div>
      </div>

      {/* Single Container with internal chips or indexed rows */}
      {elements.length === 0 ? (
        <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', padding: '4px 0' }}>empty {isSet ? 'set' : 'list'}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: isSet ? 'row' : 'column', flexWrap: isSet ? 'wrap' : 'nowrap', gap: '4px', background: '#0f172a', borderRadius: '5px', padding: '4px', border: '1px solid #1e293b' }}>
          <AnimatePresence mode="popLayout">
            {elements.map((elemVal, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration, ease: 'easeOut' }}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: isSet ? '12px' : '4px',
                  padding: '3px 6px',
                  fontSize: '11px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: 'space-between',
                }}
              >
                {!isSet && (
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#14b8a6', fontFamily: 'monospace' }}>
                    [{idx}] →
                  </span>
                )}
                <RenderValue valDto={elemVal} sourceId={`${heapId}-col-${idx}`} depth={depth} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
