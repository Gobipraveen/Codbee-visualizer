import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationSettings } from '../context/AnimationSettingsContext';

export default function HeapGraphSvgOverlay({ containerRef, stepData }) {
  const [arrows, setArrows] = useState([]);
  const [svgDimensions, setSvgDimensions] = useState({ width: '100%', height: '100%' });
  const { duration } = useAnimationSettings();

  const recalculateArrows = () => {
    if (!containerRef.current) return;

    const containerEl = containerRef.current;
    const containerRect = containerEl.getBoundingClientRect();

    // Update SVG dimensions to match total scrollable content bounds
    setSvgDimensions({
      width: Math.max(containerEl.scrollWidth, containerRect.width),
      height: Math.max(containerEl.scrollHeight, containerRect.height),
    });

    // 1. Gather all reference source anchors
    const sourceElements = containerEl.querySelectorAll('[data-ref-target]');
    const rawConnections = [];

    sourceElements.forEach((sourceEl) => {
      const targetId = sourceEl.getAttribute('data-ref-target');
      if (!targetId || targetId === 'null') return;

      const targetEl = containerEl.querySelector(`[data-heap-card-id="${targetId}"]`);
      if (!targetEl) return;

      const sourceRect = sourceEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const sourceId = sourceEl.getAttribute('data-source-id') || 'src';

      // Convert viewport coords to container scroll relative coords
      const x1 = sourceRect.right - containerRect.left + containerEl.scrollLeft;
      const y1 = sourceRect.top + sourceRect.height / 2 - containerRect.top + containerEl.scrollTop;

      const x2 = targetRect.left - containerRect.left + containerEl.scrollLeft;
      const y2 = targetRect.top + targetRect.height / 2 - containerRect.top + containerEl.scrollTop;

      rawConnections.push({
        id: `${sourceId}->${targetId}`,
        sourceId,
        targetId,
        x1,
        y1,
        x2,
        y2,
        targetRect,
      });
    });

    // 2. Count connections sharing identical targets or sources to offset parallel arrows
    const targetCounts = {};
    const targetIndexMap = {};
    const sourceCounts = {};
    const sourceIndexMap = {};

    rawConnections.forEach((conn) => {
      targetCounts[conn.targetId] = (targetCounts[conn.targetId] || 0) + 1;
      sourceCounts[conn.sourceId] = (sourceCounts[conn.sourceId] || 0) + 1;
    });

    // 3. Compute Orthogonal (Elbow) Right-Angle Path Data with Offsets
    const newArrows = rawConnections.map((conn) => {
      const { id, sourceId, targetId, x1, y1, x2, y2 } = conn;

      const tCount = targetCounts[targetId] || 1;
      const tIdx = targetIndexMap[targetId] || 0;
      targetIndexMap[targetId] = tIdx + 1;

      const sCount = sourceCounts[sourceId] || 1;
      const sIdx = sourceIndexMap[sourceId] || 0;
      sourceIndexMap[sourceId] = sIdx + 1;

      // Calculate parallel line offsets (6px spacing)
      const targetOffset = tCount > 1 ? (tIdx - (tCount - 1) / 2) * 7 : 0;
      const sourceOffset = sCount > 1 ? (sIdx - (sCount - 1) / 2) * 5 : 0;

      const sy = y1 + sourceOffset;
      const ty = y2 + targetOffset;

      let pathData = '';

      // Case A: Target is to the right of source (Normal flow: Stack -> Heap or Node -> Next)
      if (x2 > x1 + 16) {
        const midX = x1 + (x2 - x1) / 2 + (targetOffset - sourceOffset) * 0.4;
        pathData = `M ${x1} ${sy} L ${midX} ${sy} L ${midX} ${ty} L ${x2} ${ty}`;
      }
      // Case B: Target is to the left or behind (e.g. Doubly Linked List PREV link, or wrapped rows)
      else {
        const minX = Math.min(x1, x2) - 20 + targetOffset;
        pathData = `M ${x1} ${sy} L ${minX} ${sy} L ${minX} ${ty} L ${x2} ${ty}`;
      }

      return {
        id,
        pathData,
        x1,
        y1: sy,
        x2,
        y2: ty,
      };
    });

    setArrows(newArrows);
  };

  useEffect(() => {
    const timer = setTimeout(recalculateArrows, 60);
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
        width: svgDimensions.width,
        height: svgDimensions.height,
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'visible',
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
          <polygon points="0 0, 8 3, 0 6" fill="var(--arrow-stroke)" />
        </marker>
        <filter id="arrow-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="var(--arrow-stroke)" floodOpacity="0.3" />
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
            stroke="var(--arrow-stroke)"
            strokeWidth="1.75"
            strokeDasharray="5 3"
            strokeLinejoin="round"
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
            style={{ filter: 'url(#arrow-glow)' }}
          />
        ))}
      </AnimatePresence>
    </svg>
  );
}
