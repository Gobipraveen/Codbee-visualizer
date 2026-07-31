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
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '180px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link2 size={14} color="#10b981" />
          <span style={{ fontWeight: 600, color: '#34d399', fontSize: '12px', fontFamily: 'monospace' }}>
            {cleanClassName(objDto.type)}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8', background: '#0f172a', padding: '1px 6px', borderRadius: '4px' }}>
          {heapId}
        </span>
      </div>

      {/* Node Content Split (val | next) */}
      <div style={{ display: 'flex', border: '1px solid #1e293b', borderRadius: '6px', overflow: 'hidden', background: '#0f172a' }}>
        {/* Value compartment */}
        <div style={{ flex: 1, padding: '6px 8px', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>val</span>
          <div style={{ marginTop: '2px' }}>
            <RenderValue valDto={valDto} sourceId={`${heapId}-val`} />
          </div>
        </div>

        {/* Next link compartment */}
        <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>next</span>
          <div style={{ marginTop: '2px' }}>
            <RenderValue valDto={nextDto} sourceId={`${heapId}-next`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
