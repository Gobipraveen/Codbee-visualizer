import React, { useEffect } from 'react';
import { SkipBack, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';

export default function SteppingControls({ currentStep, totalSteps, onStepChange, disabled }) {
  const isFirst = currentStep <= 0;
  const isLast = totalSteps <= 0 || currentStep >= totalSteps - 1;

  const handleFirst = () => onStepChange(0);
  const handlePrev = () => onStepChange(Math.max(0, currentStep - 1));
  const handleNext = () => onStepChange(Math.min(totalSteps - 1, currentStep + 1));
  const handleLast = () => onStepChange(Math.max(0, totalSteps - 1));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled || totalSteps <= 0) return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, totalSteps, disabled]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: '#121826',
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid #1e293b'
    }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={handleFirst}
          disabled={disabled || isFirst}
          title="First Step"
          style={btnStyle(disabled || isFirst)}
        >
          <SkipBack size={16} />
        </button>
        <button
          onClick={handlePrev}
          disabled={disabled || isFirst}
          title="Previous Step (Left Arrow)"
          style={btnStyle(disabled || isFirst)}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={handleNext}
          disabled={disabled || isLast}
          title="Next Step (Right Arrow)"
          style={btnStyle(disabled || isLast, true)}
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={handleLast}
          disabled={disabled || isLast}
          title="Last Step"
          style={btnStyle(disabled || isLast)}
        >
          <SkipForward size={16} />
        </button>
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(0, totalSteps - 1)}
        value={totalSteps > 0 ? currentStep : 0}
        onChange={(e) => onStepChange(Number(e.target.value))}
        disabled={disabled || totalSteps <= 0}
        style={{ flex: 1, accentColor: '#3b82f6', cursor: disabled ? 'not-allowed' : 'pointer' }}
      />

      <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', minWidth: '100px', textAlign: 'right' }}>
        {totalSteps > 0 ? `Step ${currentStep + 1} of ${totalSteps}` : 'Step 0 of 0'}
      </span>
    </div>
  );
}

function btnStyle(disabled, primary = false) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    border: 'none',
    background: primary ? (disabled ? '#1e293b' : '#3b82f6') : '#1e293b',
    color: disabled ? '#475569' : '#f8fafc',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
  };
}
