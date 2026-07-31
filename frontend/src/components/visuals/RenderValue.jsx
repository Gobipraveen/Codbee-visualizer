import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export function RenderValue({ valDto, sourceId }) {
  const { duration } = useAnimationSettings();
  if (!valDto) return <span style={{ color: '#64748b' }}>null</span>;

  if (valDto.type === 'reference') {
    const targetRef = String(valDto.value);
    return (
      <motion.span
        key={targetRef}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration, ease: 'easeOut' }}
        data-ref-target={targetRef}
        data-source-id={sourceId}
        style={{
          color: '#c084fc',
          background: 'rgba(192,132,252,0.15)',
          border: '1px solid rgba(192,132,252,0.4)',
          borderRadius: '12px',
          padding: '2px 8px',
          fontSize: '11px',
          fontFamily: 'monospace',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'default',
          whiteSpace: 'nowrap',
        }}
      >
        <LinkIcon size={10} />
        {targetRef}
      </motion.span>
    );
  }

  if (valDto.type === 'string') {
    return (
      <motion.span
        key={String(valDto.value)}
        initial={{ scale: 0.9, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration }}
        style={{ color: '#fde047', fontFamily: 'monospace', fontSize: '12px' }}
      >
        &ldquo;{String(valDto.value).length > 24 ? valDto.value.substring(0, 24) + '…' : valDto.value}&rdquo;
      </motion.span>
    );
  }

  if (valDto.type === 'null') {
    return <span style={{ color: '#64748b', fontFamily: 'monospace' }}>null</span>;
  }

  if (valDto.type === 'primitive') {
    const v = valDto.value;
    if (v === true || v === false) {
      return (
        <motion.span
          key={String(v)}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration }}
          style={{ color: v ? '#4ade80' : '#f87171', fontFamily: 'monospace' }}
        >
          {String(v)}
        </motion.span>
      );
    }
    return (
      <motion.span
        key={String(v)}
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration }}
        style={{ color: '#38bdf8', fontFamily: 'monospace' }}
      >
        {String(v)}
      </motion.span>
    );
  }

  return (
    <motion.span
      key={String(valDto.value)}
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      transition={{ duration }}
      style={{ color: '#94a3b8', fontFamily: 'monospace' }}
    >
      {String(valDto.value)}
    </motion.span>
  );
}

export function cleanClassName(fullName) {
  if (!fullName) return '';
  const parts = fullName.split('.');
  const lastPart = parts[parts.length - 1];
  return lastPart.includes('$') ? lastPart.split('$').pop() : lastPart;
}
