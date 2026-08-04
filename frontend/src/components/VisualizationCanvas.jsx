import React from 'react';
import StackHeapPanel from './StackHeapPanel';
import VisualizationLegend from './VisualizationLegend';

export default function VisualizationCanvas({ stepData }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        background: 'var(--bg-canvas)',
      }}
    >
      {/* Collapsible Corner Legend & Key Panel */}
      <div style={{ position: 'absolute', bottom: '16px', left: '16px', zIndex: 50 }}>
        <VisualizationLegend />
      </div>

      {/* Visualizer Panel Container */}
      <div style={{ width: '100%', height: '100%', minWidth: '600px' }}>
        <StackHeapPanel stepData={stepData} />
      </div>
    </div>
  );
}
