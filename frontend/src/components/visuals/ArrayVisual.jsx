import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export default function ArrayVisual({ heapId, objDto, isNested = false, depth = 0 }) {
  const fields = objDto?.fields || {};
  const elements = objDto?.elements || [];
  const { duration } = useAnimationSettings();

  const items = elements.length > 0
    ? elements.map((elem, idx) => ({ index: idx, valDto: elem }))
    : Object.entries(fields)
        .filter(([k]) => k.startsWith('[') && k.endsWith(']'))
        .map(([k, valDto]) => ({
          index: parseInt(k.replace('[', '').replace(']', ''), 10),
          valDto,
        }))
        .sort((a, b) => a.index - b.index);

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
        border: '1px solid #3b82f6',
        boxShadow: isNested ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.15)',
        padding: isNested ? '6px 8px' : '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: isNested ? '160px' : '220px',
        maxWidth: isNested ? '100%' : '340px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Box size={13} color="#3b82f6" />
          <span style={{ fontWeight: 600, color: '#60a5fa', fontSize: '11px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto?.type || 'Array')}
          </span>
        </div>
      </div>

      {/* Filmstrip Row of Cells */}
      {items.length === 0 ? (
        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>empty array</div>
      ) : (
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
          <AnimatePresence mode="popLayout">
            {items.map(({ index, valDto }) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration, ease: 'easeOut' }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '42px',
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '4px 6px',
                }}
              >
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#64748b', marginBottom: '2px', fontFamily: 'monospace' }}>
                  [{index}]
                </span>
                <div style={{ fontSize: '12px' }}>
                  <RenderValue valDto={valDto} sourceId={`${heapId}-idx-${index}`} depth={depth} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
