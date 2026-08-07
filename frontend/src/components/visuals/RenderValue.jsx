import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

import HeapCardFactory from './HeapCardFactory';

function NestedObjectWrapper({ nestedObj, depth }) {
  const [isExpanded, setIsExpanded] = React.useState(depth <= 1);
  const typeName = cleanClassName(nestedObj?.type || 'Object');
  const count = nestedObj?.elements?.length || Object.keys(nestedObj?.fields || {}).length;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', verticalAlign: 'middle', margin: '2px 0' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: isExpanded ? '3px' : '0' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          title={isExpanded ? 'Collapse nested collection' : 'Expand nested collection'}
          style={{
            background: isExpanded ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: isExpanded ? '1px solid #ef4444' : '1px solid #10b981',
            color: isExpanded ? '#f87171' : '#34d399',
            borderRadius: '4px',
            padding: '1px 5px',
            fontSize: '10px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            cursor: 'pointer',
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isExpanded ? '–' : '+'}
        </button>
        {!isExpanded && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              color: 'var(--primary)',
              cursor: 'pointer',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '4px',
              padding: '1px 6px',
            }}
          >
            {typeName} ({count} {count === 1 ? 'item' : 'items'})
          </span>
        )}
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          <HeapCardFactory heapId={nestedObj.id || 'nested'} objDto={nestedObj} isNested={true} depth={depth + 1} />
        </motion.div>
      )}
    </div>
  );
}

export function RenderValue({ valDto, sourceId, depth = 0 }) {
  const { duration } = useAnimationSettings();
  if (!valDto) return <span style={{ color: 'var(--text-subtle)' }}>null</span>;

  if ((valDto.type === 'nested_object' || valDto.nestedObject) && valDto.nestedObject) {
    if (depth >= 3) {
      return (
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'monospace' }}>
          {valDto.nestedObject.type || 'Object'} …
        </span>
      );
    }
    return <NestedObjectWrapper nestedObj={valDto.nestedObject} depth={depth} />;
  }

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
