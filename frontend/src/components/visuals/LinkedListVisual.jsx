import React from 'react';
import { RenderValue, cleanClassName } from './RenderValue';
import { Link2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

export default function LinkedListVisual({ heapId, objDto }) {
  const fields = objDto?.fields || {};
  const valDto = fields.val || fields.value || fields.data || fields.item;
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
        background: '#121826',
        borderRadius: '8px',
        border: '1px solid #10b981',
        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.15)',
        padding: '6px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: '120px',
        maxWidth: '160px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link2 size={13} color="#10b981" />
          <span style={{ fontWeight: 600, color: '#34d399', fontSize: '11px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto.type)}
          </span>
        </div>
      </div>

      {/* Fixed 2-Cell Node Template [ val | next ] */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', border: '1px solid #1e293b', borderRadius: '5px', overflow: 'hidden', background: '#0f172a', alignItems: 'center' }}>
        {/* Value Sub-Cell (Visually Emphasized Left) */}
        <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }}>
          <span style={{ fontSize: '8px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', lineHeight: '1' }}>val</span>
          <div style={{ marginTop: '1px', fontSize: '13px', fontWeight: 700, color: '#6ee7b7' }}>
            <RenderValue valDto={valDto} sourceId={`${heapId}-val`} />
          </div>
        </div>

        {/* Next Sub-Cell (Muted Pointer Cell Right) */}
        <div style={{ padding: '3px 5px', borderLeft: '1px solid #1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0b1120' }}>
          <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', lineHeight: '1' }}>next →</span>
          <div style={{ marginTop: '1px' }}>
            <RenderValue valDto={nextDto} sourceId={`${heapId}-next`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
