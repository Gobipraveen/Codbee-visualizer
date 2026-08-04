import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { GitFork } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export default function TreeVisual({ heapId, objDto }) {
  const fields = objDto?.fields || {};
  const valDto = fields.val || fields.value || fields.data || fields.key;
  const leftDto = fields.left;
  const rightDto = fields.right;
  const { duration } = useAnimationSettings();

  return (
    <motion.div
      data-heap-card-id={heapId}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration, ease: 'easeOut' }}
      style={{
        background: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--type-tree)',
        boxShadow: '0 4px 10px rgba(6, 182, 212, 0.15)',
        padding: '6px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: '130px',
        maxWidth: '180px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <GitFork size={13} color="var(--type-tree)" />
          <span style={{ fontWeight: 600, color: 'var(--type-tree)', fontSize: '11px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto.type)}
          </span>
        </div>
      </div>

      {/* Fixed 3-Cell Tree Node Template [ left | val | right ] */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', border: '1px solid var(--bg-card-border)', borderRadius: '5px', overflow: 'hidden', background: 'var(--bg-cell)', alignItems: 'center' }}>
        {/* Left Sub-Cell (Muted Pointer Cell) */}
        <div style={{ padding: '3px 5px', borderRight: '1px solid var(--bg-card-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-pointer-cell)' }}>
          <span style={{ fontSize: '8px', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', lineHeight: '1' }}>← left</span>
          <div style={{ marginTop: '1px' }}>
            <RenderValue valDto={leftDto} sourceId={`${heapId}-left`} />
          </div>
        </div>

        {/* Value Sub-Cell (Visually Emphasized Center) */}
        <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }}>
          <span style={{ fontSize: '8px', color: 'var(--type-tree)', fontWeight: 700, textTransform: 'uppercase', lineHeight: '1' }}>val</span>
          <div style={{ marginTop: '1px', fontSize: '13px', fontWeight: 700, color: 'var(--type-tree)' }}>
            <RenderValue valDto={valDto} sourceId={`${heapId}-val`} />
          </div>
        </div>

        {/* Right Sub-Cell (Muted Pointer Cell) */}
        <div style={{ padding: '3px 5px', borderLeft: '1px solid var(--bg-card-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-pointer-cell)' }}>
          <span style={{ fontSize: '8px', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', lineHeight: '1' }}>right →</span>
          <div style={{ marginTop: '1px' }}>
            <RenderValue valDto={rightDto} sourceId={`${heapId}-right`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
