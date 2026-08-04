import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { ArrowLeftRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export default function DoublyLinkedListVisual({ heapId, objDto }) {
  const fields = objDto?.fields || {};
  const valDto = fields.val || fields.value || fields.data || fields.key;
  const prevDto = fields.prev || fields.previous;
  const nextDto = fields.next;
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
        border: '1px solid var(--type-doubly-list)',
        boxShadow: '0 4px 10px rgba(139, 92, 246, 0.15)',
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
          <ArrowLeftRight size={13} color="var(--type-doubly-list)" />
          <span style={{ fontWeight: 600, color: 'var(--type-doubly-list)', fontSize: '11px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto.type)}
          </span>
        </div>
      </div>

      {/* Fixed 3-Cell Doubly Node Template [ prev | val | next ] */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', border: '1px solid var(--bg-card-border)', borderRadius: '5px', overflow: 'hidden', background: 'var(--bg-cell)', alignItems: 'center' }}>
        {/* Prev Sub-Cell (Muted Left Pointer) */}
        <div style={{ padding: '3px 5px', borderRight: '1px solid var(--bg-card-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-pointer-cell)' }}>
          <span style={{ fontSize: '8px', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', lineHeight: '1' }}>← prev</span>
          <div style={{ marginTop: '1px' }}>
            <RenderValue valDto={prevDto} sourceId={`${heapId}-prev`} />
          </div>
        </div>

        {/* Value Sub-Cell (Visually Emphasized Center) */}
        <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }}>
          <span style={{ fontSize: '8px', color: 'var(--type-doubly-list)', fontWeight: 700, textTransform: 'uppercase', lineHeight: '1' }}>val</span>
          <div style={{ marginTop: '1px', fontSize: '13px', fontWeight: 700, color: 'var(--type-doubly-list)' }}>
            <RenderValue valDto={valDto} sourceId={`${heapId}-val`} />
          </div>
        </div>

        {/* Next Sub-Cell (Muted Right Pointer) */}
        <div style={{ padding: '3px 5px', borderLeft: '1px solid var(--bg-card-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-pointer-cell)' }}>
          <span style={{ fontSize: '8px', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', lineHeight: '1' }}>next →</span>
          <div style={{ marginTop: '1px' }}>
            <RenderValue valDto={nextDto} sourceId={`${heapId}-next`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
