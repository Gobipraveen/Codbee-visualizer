import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import StackHeapPanel from './StackHeapPanel';

export default function VisualizationCanvas({ stepData }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Reset zoom & pan to default
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Zoom in / out handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(2.5, prev + 0.15));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.4, prev - 0.15));
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    // Only zoom if wheel is over canvas
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setScale((prev) => Math.min(2.5, Math.max(0.4, prev * zoomFactor)));
  };

  // Mouse drag panning
  const handleMouseDown = (e) => {
    // Only start pan if left click and target is background or canvas area (not clicking interactive pills)
    if (e.button !== 0) return;
    // Don't drag if clicking buttons or inside variable tables directly unless dragging empty space
    const targetTag = e.target.tagName.toLowerCase();
    if (['button', 'input', 'a', 'select'].includes(targetTag)) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#090d16',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      {/* Floating Canvas Controls (Zoom In, Zoom Out, Reset) */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(18, 24, 38, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '4px 8px',
          borderRadius: '8px',
          border: '1px solid #1e293b',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleZoomOut}
          title="Zoom Out (Wheel Down)"
          style={controlBtnStyle}
        >
          <ZoomOut size={15} />
        </button>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#94a3b8',
            minWidth: '42px',
            textAlign: 'center',
            fontFamily: 'monospace',
          }}
        >
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          title="Zoom In (Wheel Up)"
          style={controlBtnStyle}
        >
          <ZoomIn size={15} />
        </button>
        <div style={{ width: '1px', height: '16px', background: '#334155', margin: '0 4px' }} />
        <button
          onClick={handleReset}
          title="Reset Zoom & Pan"
          style={controlBtnStyle}
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Transformed Visualizer Container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <StackHeapPanel stepData={stepData} />
      </div>
    </div>
  );
}

const controlBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  background: 'transparent',
  border: 'none',
  borderRadius: '4px',
  color: '#cbd5e1',
  cursor: 'pointer',
  transition: 'background 0.15s',
};
