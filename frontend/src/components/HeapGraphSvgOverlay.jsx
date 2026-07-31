import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationSettings } from '../context/AnimationSettingsContext';

export default function HeapGraphSvgOverlay({ containerRef, stepData }) {
  const [arrows, setArrows] = useState([]);
  const { duration } = useAnimationSettings();

  const recalculateArrows = () => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newArrows = [];

    // Find all reference source anchors
    const sourceElements = containerRef.current.querySelectorAll('[data-ref-target]');

    sourceElements.forEach((sourceEl) => {
      const targetId = sourceEl.getAttribute('data-ref-target');
      if (!targetId || targetId === 'null') return;

      const targetEl = containerRef.current.querySelector(`[data-heap-card-id="${targetId}"]`);
      if (!targetEl) return;

      const sourceRect = sourceEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      // Compute relative start (right edge of source pill)
      const x1 = sourceRect.right - containerRect.left;
      const y1 = sourceRect.top + sourceRect.height / 2 - containerRect.top;

      // Compute relative end (left edge of target card)
      const x2 = targetRect.left - containerRect.left;
      const y2 = targetRect.top + 20 - containerRect.top; // Point near top header of card

      // Control points for a smooth Bezier curve
      const dx = Math.abs(x2 - x1);
      const cx1 = x1 + Math.max(30, dx * 0.4);
      const cy1 = y1;
      const cx2 = x2 - Math.max(30, dx * 0.4);
      const cy2 = y2;

      const pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

      const sourceId = sourceEl.getAttribute('data-source-id') || 'src';

      newArrows.push({
        id: `${sourceId}->${targetId}`,
        pathData,
        x1, y1, x2, y2
      });
    });

    setArrows(newArrows);
  };

  useEffect(() => {
    // Recalculate after DOM renders
    const timer = setTimeout(recalculateArrows, 50);
    window.addEventListener('resize', recalculateArrows);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', recalculateArrows);
    };
  }, [stepData]);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#a78bfa" />
        </marker>
      </defs>
      <AnimatePresence>
        {arrows.map((arrow) => (
          <motion.path
            key={arrow.id}
            initial={{ opacity: 0, pathLength: 0.2 }}
            animate={{ opacity: 1, pathLength: 1, d: arrow.pathData }}
            exit={{ opacity: 0 }}
            transition={{ duration, ease: 'easeInOut' }}
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2"
            strokeDasharray="4 2"
            markerEnd="url(#arrowhead)"
          />
        ))}
      </AnimatePresence>
    </svg>
  );
}
