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
      background: 'rgba(32, 34, 44, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      padding: '10px 16px',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.09)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
    }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={handleFirst}
          disabled={disabled || isFirst}
          title="First Step"
          style={btnStyle(disabled || isFirst)}
        >
          <SkipBack size={15} />
        </button>
        <button
          onClick={handlePrev}
          disabled={disabled || isFirst}
          title="Previous Step (Left Arrow)"
          style={btnStyle(disabled || isFirst)}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={handleNext}
          disabled={disabled || isLast}
          title="Next Step (Right Arrow)"
          style={btnStyle(disabled || isLast, true)}
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={handleLast}
          disabled={disabled || isLast}
          title="Last Step"
          style={btnStyle(disabled || isLast)}
        >
          <SkipForward size={15} />
        </button>
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(0, totalSteps - 1)}
        value={totalSteps > 0 ? currentStep : 0}
        onChange={(e) => onStepChange(Number(e.target.value))}
        disabled={disabled || totalSteps <= 0}
        style={{ flex: 1, accentColor: '#0a84ff', cursor: disabled ? 'not-allowed' : 'pointer' }}
      />

      <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', minWidth: '95px', textAlign: 'right', fontFamily: 'var(--font-mac)' }}>
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
    width: '32px',
    height: '32px',
    borderRadius: '7px',
    border: primary ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
    background: primary
      ? (disabled ? 'rgba(255, 255, 255, 0.08)' : 'linear-gradient(180deg, #0a84ff 0%, #0066cc 100%)')
      : 'rgba(255, 255, 255, 0.07)',
    color: disabled ? '#475569' : '#ffffff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: primary && !disabled ? '0 2px 6px rgba(10, 132, 255, 0.4)' : '0 1px 2px rgba(0, 0, 0, 0.1)'
  };
}
