import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export function RenderValue({ valDto, sourceId }) {
  const { duration } = useAnimationSettings();
  if (!valDto) return <span style={{ color: '#64748b' }} title="null">null</span>;

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
        title={`Reference -> ${targetRef}`}
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
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <LinkIcon size={10} />
        {targetRef}
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
        title={`"${fullStr}" (${fullStr.length} chars)`}
        style={{
          color: '#fde047',
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
    return <span style={{ color: '#64748b', fontFamily: 'monospace' }} title="null">null</span>;
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
          title={`boolean: ${fullStr}`}
          style={{ color: v ? '#4ade80' : '#f87171', fontFamily: 'monospace' }}
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
        title={fullStr}
        style={{
          color: '#38bdf8',
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
      title={fullStr}
      style={{
        color: '#94a3b8',
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
