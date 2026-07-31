import React, { createContext, useContext, useState } from 'react';

const AnimationSettingsContext = createContext();

export function AnimationSettingsProvider({ children }) {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState('normal'); // 'slow' | 'normal' | 'fast'

  const duration = !animationsEnabled
    ? 0
    : animationSpeed === 'fast'
    ? 0.12
    : animationSpeed === 'slow'
    ? 0.45
    : 0.25;

  return (
    <AnimationSettingsContext.Provider
      value={{
        animationsEnabled,
        setAnimationsEnabled,
        animationSpeed,
        setAnimationSpeed,
        duration,
      }}
    >
      {children}
    </AnimationSettingsContext.Provider>
  );
}

export function useAnimationSettings() {
  const ctx = useContext(AnimationSettingsContext);
  if (!ctx) {
    return {
      animationsEnabled: true,
      setAnimationsEnabled: () => {},
      animationSpeed: 'normal',
      setAnimationSpeed: () => {},
      duration: 0.25,
    };
  }
  return ctx;
}
