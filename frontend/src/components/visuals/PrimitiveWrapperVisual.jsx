import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { motion } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export default function PrimitiveWrapperVisual({ heapId, objDto }) {
  const valDto = objDto?.fields?.value;
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
        borderRadius: '20px',
        border: '1px solid #6366f1',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
        padding: '4px 12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 600, fontFamily: 'monospace' }}>
        {cleanClassName(objDto.type)}:
      </span>
      <RenderValue valDto={valDto} sourceId={`${heapId}-val`} />
    </motion.div>
  );
}
