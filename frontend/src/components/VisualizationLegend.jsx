import React, { useState } from 'react';
import { HelpCircle, X, Box, Link2, ArrowLeftRight, GitFork, Layers, ArrowRightLeft, ListFilter, Map as MapIcon, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LEGEND_ITEMS = [
  { type: 'Array', color: '#3b82f6', icon: Box, desc: 'Horizontal filmstrip cells with index numbers [0]' },
  { type: 'Singly Linked List', color: '#10b981', icon: Link2, desc: 'Compact 2-cell boxes [ val | next → ]' },
  { type: 'Doubly Linked List', color: '#8b5cf6', icon: ArrowLeftRight, desc: 'Compact 3-cell boxes [ ← prev | val | next → ]' },
  { type: 'Tree Node', color: '#06b6d4', icon: GitFork, desc: 'Compact 3-cell boxes [ ← left | val | right → ]' },
  { type: 'Stack', color: '#f97316', icon: Layers, desc: 'Single vertical container with nested rows & TOP tag' },
  { type: 'Queue', color: '#a855f7', icon: ArrowRightLeft, desc: 'FIFO horizontal tube (FRONT → to ← REAR)' },
  { type: 'List & Set', color: '#14b8a6', icon: ListFilter, desc: 'Single container with nested element chips' },
  { type: 'Map', color: '#f59e0b', icon: MapIcon, desc: 'Single container with key → value inline rows' },
  { type: 'StringBuilder', color: '#ec4899', icon: Type, desc: 'Sequence of scrabble character blocks' },
  { type: 'Generic Object', color: '#64748b', icon: Box, desc: 'Fallback table of object fields and values' },
];

export default function VisualizationLegend() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {/* Legend Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              bottom: '40px',
              left: 0,
              width: '340px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              padding: '12px 14px',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={14} color="#38bdf8" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.5px' }}>
                  Visual Types Legend
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px', display: 'flex' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Legend Grid Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
              {LEGEND_ITEMS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.type} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: item.color,
                        background: `${item.color}15`,
                        border: `1px solid ${item.color}40`,
                        borderRadius: '4px',
                        padding: '1px 6px',
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        minWidth: '115px',
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent size={11} />
                      {item.type}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '10px', lineHeight: '1.4' }}>
                      {item.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: isOpen ? '#1e293b' : '#0f172a',
          border: '1px solid #334155',
          color: '#cbd5e1',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.15s ease',
        }}
        title="Toggle Visual Types Legend"
      >
        <HelpCircle size={14} color="#38bdf8" />
        <span>Legend</span>
      </button>
    </div>
  );
}
