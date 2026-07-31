import React, { useRef, useEffect } from 'react';
import { useAnimationSettings } from '../context/AnimationSettingsContext';
import { Settings, Zap, SlidersHorizontal, Check, X } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const {
    animationsEnabled,
    setAnimationsEnabled,
    animationSpeed,
    setAnimationSpeed,
  } = useAnimationSettings();

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      style={{
        position: 'absolute',
        top: '46px',
        right: '16px',
        width: '280px',
        background: '#121826',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        padding: '14px',
        zIndex: 1000,
        color: '#f8fafc',
      }}
    >
      {/* Modal Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '8px',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px' }}>
          <Settings size={15} color="#3b82f6" />
          <span>Visualization Settings</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Enable Animations Toggle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <span style={{ color: '#cbd5e1', fontWeight: 500 }}>Enable smooth animations</span>
          <input
            type="checkbox"
            checked={animationsEnabled}
            onChange={(e) => setAnimationsEnabled(e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              accentColor: '#3b82f6',
              cursor: 'pointer',
            }}
          />
        </label>

        {/* Speed Segmented Control */}
        <div style={{ opacity: animationsEnabled ? 1 : 0.4, pointerEvents: animationsEnabled ? 'auto' : 'none' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
            Animation Speed
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px',
              background: '#0f172a',
              padding: '3px',
              borderRadius: '6px',
              border: '1px solid #1e293b',
            }}
          >
            {[
              { id: 'slow', label: 'Slow (400ms)' },
              { id: 'normal', label: 'Normal' },
              { id: 'fast', label: 'Fast (120ms)' },
            ].map((spd) => {
              const active = animationSpeed === spd.id;
              return (
                <button
                  key={spd.id}
                  onClick={() => setAnimationSpeed(spd.id)}
                  style={{
                    background: active ? '#2563eb' : 'transparent',
                    color: active ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '5px 0',
                    fontSize: '11px',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {spd.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
