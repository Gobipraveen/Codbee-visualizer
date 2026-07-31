import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationSettings } from '../context/AnimationSettingsContext';

export default function HeapGraphSvgOverlay({ containerRef, stepData }) {
  const [arrows, setArrows] = useState([]);
  const { duration } = useAnimationSettings();

  const recalculateArrows = () => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();

    // 1. Gather all reference source anchors
    const sourceElements = containerRef.current.querySelectorAll('[data-ref-target]');
    const rawConnections = [];

    sourceElements.forEach((sourceEl) => {
      const targetId = sourceEl.getAttribute('data-ref-target');
      if (!targetId || targetId === 'null') return;

      const targetEl = containerRef.current.querySelector(`[data-heap-card-id="${targetId}"]`);
      if (!targetEl) return;

      const sourceRect = sourceEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const sourceId = sourceEl.getAttribute('data-source-id') || 'src';

      rawConnections.push({
        id: `${sourceId}->${targetId}`,
        targetId,
        sourceRect,
        targetRect,
      });
    });

    // 2. Count arrows per target to distribute arrival Y offsets vertically along target left edge
    const targetCounts = {};
    const targetCurrentIndex = {};

    rawConnections.forEach((conn) => {
      targetCounts[conn.targetId] = (targetCounts[conn.targetId] || 0) + 1;
    });

    // 3. Compute clean Bezier path data for each connection
    const newArrows = rawConnections.map((conn) => {
      const { id, targetId, sourceRect, targetRect } = conn;
      const count = targetCounts[targetId] || 1;
      const currIdx = targetCurrentIndex[targetId] || 0;
      targetCurrentIndex[targetId] = currIdx + 1;

      // Start: right middle of source pill
      const x1 = sourceRect.right - containerRect.left;
      const y1 = sourceRect.top + sourceRect.height / 2 - containerRect.top;

      // Target: center-left of target card + vertical offset distribution
      const targetCenterY = targetRect.top + targetRect.height / 2 - containerRect.top;
      // Calculate offset spread (max spread range 32px)
      const offsetStep = count > 1 ? Math.min(14, 32 / (count - 1)) : 0;
      const targetYOffset = (currIdx - (count - 1) / 2) * offsetStep;

      const x2 = targetRect.left - containerRect.left;
      const y2 = Math.max(targetRect.top - containerRect.top + 10, Math.min(targetRect.bottom - containerRect.top - 10, targetCenterY + targetYOffset));

      // Adaptive Bezier curve control points
      const dx = Math.abs(x2 - x1);
      const curveOffset = Math.min(120, Math.max(30, dx * 0.45));
      const cx1 = x1 + curveOffset;
      const cy1 = y1;
      const cx2 = x2 - curveOffset;
      const cy2 = y2;

      const pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

      return {
        id,
        pathData,
        x1, y1, x2, y2
      };
    });

    setArrows(newArrows);
  };

  useEffect(() => {
    // Recalculate after DOM renders & fonts load
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
        zIndex: 10,
        overflow: 'visible',
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="9"
          markerHeight="7"
          refX="8"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 9 3.5, 0 7" fill="#c084fc" />
        </marker>
        <filter id="arrow-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#c084fc" floodOpacity="0.3" />
        </filter>
      </defs>
      <AnimatePresence>
        {arrows.map((arrow) => (
          <motion.path
            key={arrow.id}
            initial={{ opacity: 0, pathLength: 0.2 }}
            animate={{ opacity: 0.85, pathLength: 1, d: arrow.pathData }}
            exit={{ opacity: 0 }}
            transition={{ duration, ease: 'easeInOut' }}
            fill="none"
            stroke="#c084fc"
            strokeWidth="1.75"
            strokeDasharray="5 3"
            markerEnd="url(#arrowhead)"
            style={{ filter: 'url(#arrow-glow)' }}
          />
        ))}
      </AnimatePresence>
    </svg>
  );
}
