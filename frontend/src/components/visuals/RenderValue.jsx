import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export function RenderValue({ valDto, sourceId }) {
  const { duration } = useAnimationSettings();
  if (!valDto) return <span style={{ color: 'var(--text-subtle)' }}>null</span>;

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
        title="Reference link"
        style={{
          color: 'var(--arrow-stroke)',
          background: 'rgba(147, 51, 234, 0.12)',
          border: '1px solid var(--arrow-stroke)',
          borderRadius: '12px',
          padding: '2px 6px',
          fontSize: '11px',
          fontFamily: 'monospace',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <LinkIcon size={11} />
      </motion.span>
    );
  }

  if (valDto.type === 'string') {
    const fullStr = String(valDto.value);
    return (
      <motion.span
        key={fullStr}
        initial={{ scale: 0.9, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration }}
        title={`"${fullStr}"`}
        style={{
          color: 'var(--type-map)',
          fontFamily: 'monospace',
          fontSize: '12px',
          maxWidth: '150px',
          display: 'inline-block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          verticalAlign: 'bottom',
        }}
      >
        &ldquo;{fullStr.length > 20 ? fullStr.substring(0, 20) + '…' : fullStr}&rdquo;
      </motion.span>
    );
  }

  if (valDto.type === 'null') {
    return <span style={{ color: 'var(--text-subtle)', fontFamily: 'monospace' }}>null</span>;
  }

  if (valDto.type === 'primitive') {
    const v = valDto.value;
    const fullStr = String(v);
    if (v === true || v === false) {
      return (
        <motion.span
          key={fullStr}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration }}
          style={{ color: v ? 'var(--success)' : 'var(--danger)', fontFamily: 'monospace' }}
        >
          {fullStr}
        </motion.span>
      );
    }
    return (
      <motion.span
        key={fullStr}
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration }}
        style={{
          color: 'var(--primary)',
          fontFamily: 'monospace',
          maxWidth: '140px',
          display: 'inline-block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          verticalAlign: 'bottom',
        }}
      >
        {fullStr}
      </motion.span>
    );
  }

  const fullStr = String(valDto.value);
  return (
    <motion.span
      key={fullStr}
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      transition={{ duration }}
      style={{
        color: 'var(--text-muted)',
        fontFamily: 'monospace',
        maxWidth: '140px',
        display: 'inline-block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        verticalAlign: 'bottom',
      }}
    >
      {fullStr}
    </motion.span>
  );
}

export function cleanClassName(fullName) {
  if (!fullName) return '';
  const parts = fullName.split('.');
  const lastPart = parts[parts.length - 1];
  return lastPart.includes('$') ? lastPart.split('$').pop() : lastPart;
}
