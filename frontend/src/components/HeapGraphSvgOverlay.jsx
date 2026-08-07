import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationSettings } from '../context/AnimationSettingsContext';

export default function HeapGraphSvgOverlay({ containerRef, stepData }) {
  const [arrows, setArrows] = useState([]);
  const [svgDimensions, setSvgDimensions] = useState({ width: '100%', height: '100%' });
  const [hoveredArrowId, setHoveredArrowId] = useState(null);
  const [lockedArrowId, setLockedArrowId] = useState(null);
  const { duration } = useAnimationSettings();

  const activeArrowId = hoveredArrowId || lockedArrowId;

  // Clear locked selection when clicking empty space in canvas
  useEffect(() => {
    const handleCanvasClick = (e) => {
      if (e.target.tagName !== 'path' && e.target.tagName !== 'text' && e.target.tagName !== 'rect') {
        setLockedArrowId(null);
      }
    };
    window.addEventListener('click', handleCanvasClick);
    return () => window.removeEventListener('click', handleCanvasClick);
  }, []);

  const recalculateArrows = () => {
    if (!containerRef.current) return;

    const containerEl = containerRef.current;
    const containerRect = containerEl.getBoundingClientRect();

    // Update SVG dimensions to match total scrollable content bounds
    setSvgDimensions({
      width: Math.max(containerEl.scrollWidth, containerRect.width),
      height: Math.max(containerEl.scrollHeight, containerRect.height),
    });

    // Gather bounding boxes of all heap cards for smart detour routing
    const cardElements = Array.from(containerEl.querySelectorAll('[data-heap-card-id]'));
    const cardBoxes = cardElements.map((card) => {
      const rect = card.getBoundingClientRect();
      return {
        id: card.getAttribute('data-heap-card-id'),
        left: rect.left - containerRect.left + containerEl.scrollLeft,
        right: rect.right - containerRect.left + containerEl.scrollLeft,
        top: rect.top - containerRect.top + containerEl.scrollTop,
        bottom: rect.bottom - containerRect.top + containerEl.scrollTop,
      };
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

      // Source label extraction for arrow tooltip
      const sourceLabel = sourceId.replace(/^stack-\d+-/, '');
      const targetType = targetEl.querySelector('span')?.textContent || 'Object';

      const x1 = sourceRect.right - containerRect.left + containerEl.scrollLeft;
      const y1 = sourceRect.top + sourceRect.height / 2 - containerRect.top + containerEl.scrollTop;

      const x2 = targetRect.left - containerRect.left + containerEl.scrollLeft;
      const y2 = targetRect.top + targetRect.height / 2 - containerRect.top + containerEl.scrollTop;

      rawConnections.push({
        id: `${sourceId}->${targetId}`,
        sourceId,
        targetId,
        sourceLabel,
        targetType,
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

    // 3. Compute Smart Orthogonal (Elbow) Right-Angle Path Data with Parallel Offsets & Box Detours
    const newArrows = rawConnections.map((conn) => {
      const { id, sourceId, targetId, sourceLabel, targetType, x1, y1, x2, y2 } = conn;

      const tCount = targetCounts[targetId] || 1;
      const tIdx = targetIndexMap[targetId] || 0;
      targetIndexMap[targetId] = tIdx + 1;

      const sCount = sourceCounts[sourceId] || 1;
      const sIdx = sourceIndexMap[sourceId] || 0;
      sourceIndexMap[sourceId] = sIdx + 1;

      // Calculate parallel line offsets (7px spacing)
      const targetOffset = tCount > 1 ? (tIdx - (tCount - 1) / 2) * 7 : 0;
      const sourceOffset = sCount > 1 ? (sIdx - (sCount - 1) / 2) * 5 : 0;

      const sy = y1 + sourceOffset;
      const ty = y2 + targetOffset;

      let midX = x1 + (x2 - x1) / 2 + (targetOffset - sourceOffset) * 0.4;
      let pathData = '';

      // Check if midX passes through any intermediate box
      if (x2 > x1 + 16) {
        cardBoxes.forEach((box) => {
          if (box.id !== targetId && midX > box.left - 8 && midX < box.right + 8) {
            // Detour around the card boundary
            if (sy < box.top || ty < box.top) {
              midX = box.left - 16;
            } else {
              midX = box.right + 16;
            }
          }
        });
        pathData = `M ${x1} ${sy} L ${midX} ${sy} L ${midX} ${ty} L ${x2} ${ty}`;
      } else {
        const minX = Math.min(x1, x2) - 20 + targetOffset;
        midX = minX;
        pathData = `M ${x1} ${sy} L ${minX} ${sy} L ${minX} ${ty} L ${x2} ${ty}`;
      }

      // Midpoint coordinates for interactive tooltip placement
      const labelX = midX;
      const labelY = (sy + ty) / 2;

      return {
        id,
        sourceId,
        targetId,
        sourceLabel,
        targetType,
        pathData,
        x1,
        y1: sy,
        x2,
        y2: ty,
        labelX,
        labelY,
      };
    });

    setArrows(newArrows);
  };

  useEffect(() => {
    const timer = setTimeout(recalculateArrows, 60);
    window.addEventListener('resize', recalculateArrows);

    let observer = null;
    if (containerRef.current) {
      observer = new ResizeObserver(() => {
        recalculateArrows();
      });
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', recalculateArrows);
      if (observer) observer.disconnect();
    };
  }, [stepData]);

  // Synchronize Source and Target Highlight CSS classes on active selection change
  useEffect(() => {
    if (!containerRef.current) return;
    const containerEl = containerRef.current;

    // Clear previous highlights
    containerEl.querySelectorAll('.arrow-highlight-source').forEach((el) => el.classList.remove('arrow-highlight-source'));
    containerEl.querySelectorAll('.arrow-highlight-target').forEach((el) => el.classList.remove('arrow-highlight-target'));

    if (!activeArrowId) return;

    const activeArrow = arrows.find((a) => a.id === activeArrowId);
    if (!activeArrow) return;

    // Highlight source element
    const sourceEl = containerEl.querySelector(`[data-source-id="${activeArrow.sourceId}"]`);
    if (sourceEl) sourceEl.classList.add('arrow-highlight-source');

    // Highlight target heap card
    const targetEl = containerEl.querySelector(`[data-heap-card-id="${activeArrow.targetId}"]`);
    if (targetEl) targetEl.classList.add('arrow-highlight-target');
  }, [activeArrowId, arrows]);

  // Sort arrows so active arrow is rendered LAST (on top in SVG DOM layering)
  const sortedArrows = [...arrows].sort((a, b) => {
    if (a.id === activeArrowId) return 1;
    if (b.id === activeArrowId) return -1;
    return 0;
  });

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
        {/* Normal Arrowhead Marker */}
        <marker
          id="arrowhead-normal"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="var(--arrow-stroke)" />
        </marker>

        {/* Selected Accent Arrowhead Marker */}
        <marker
          id="arrowhead-active"
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 10 4, 0 8" fill="#00f0ff" />
        </marker>

        {/* Glow Filters */}
        <filter id="arrow-glow-normal" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="var(--arrow-stroke)" floodOpacity="0.3" />
        </filter>

        <filter id="arrow-glow-active" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00f0ff" floodOpacity="0.9" />
        </filter>
      </defs>

      <AnimatePresence>
        {sortedArrows.map((arrow) => {
          const isSelected = arrow.id === activeArrowId;

          return (
            <g key={arrow.id} style={{ pointerEvents: 'auto', cursor: 'pointer' }}>
              {/* Invisible thick hit-area path for easy hovering/clicking */}
              <path
                d={arrow.pathData}
                fill="none"
                stroke="transparent"
                strokeWidth="14"
                onMouseEnter={() => setHoveredArrowId(arrow.id)}
                onMouseLeave={() => setHoveredArrowId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setLockedArrowId((prev) => (prev === arrow.id ? null : arrow.id));
                }}
              />

              {/* Visual Animated Arrow Path */}
              <motion.path
                initial={{ opacity: 0, pathLength: 0.2 }}
                animate={{
                  opacity: isSelected ? 1 : 0.85,
                  pathLength: 1,
                  d: arrow.pathData,
                  stroke: isSelected ? '#00f0ff' : 'var(--arrow-stroke)',
                  strokeWidth: isSelected ? 3.75 : 1.75,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration, ease: 'easeInOut' }}
                fill="none"
                strokeDasharray={isSelected ? 'none' : '5 3'}
                strokeLinejoin="round"
                strokeLinecap="round"
                markerEnd={isSelected ? 'url(#arrowhead-active)' : 'url(#arrowhead-normal)'}
                style={{ filter: isSelected ? 'url(#arrow-glow-active)' : 'url(#arrow-glow-normal)' }}
                onMouseEnter={() => setHoveredArrowId(arrow.id)}
                onMouseLeave={() => setHoveredArrowId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setLockedArrowId((prev) => (prev === arrow.id ? null : arrow.id));
                }}
              />

              {/* Floating Tooltip Midpoint Label on Selection */}
              {isSelected && (
                <g transform={`translate(${arrow.labelX}, ${arrow.labelY})`}>
                  <rect
                    x="-45"
                    y="-12"
                    width="90"
                    height="20"
                    rx="4"
                    fill="#0f172a"
                    stroke="#00f0ff"
                    strokeWidth="1.5"
                    style={{ filter: 'drop-shadow(0 2px 8px rgba(0,240,255,0.4))' }}
                  />
                  <text
                    x="0"
                    y="2"
                    textAnchor="middle"
                    fill="#00f0ff"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {arrow.sourceLabel} ➔ {arrow.targetType}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </AnimatePresence>
    </svg>
  );
}
