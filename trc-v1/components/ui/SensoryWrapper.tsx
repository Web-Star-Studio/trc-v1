// Wrapper component that respects sensory preferences
import React, { ReactNode } from 'react';
import { Animated, View } from 'react-native';
import { useSensory } from '@/lib/context/SensoryContext';

interface SensoryWrapperProps {
  children: ReactNode;
  animation?: 'fade' | 'slide' | 'scale';
  duration?: number;
}

export function SensoryWrapper({ children, animation, duration = 300 }: SensoryWrapperProps) {
  const { getAnimationDuration } = useSensory();
  const animationDuration = getAnimationDuration(duration);

  // If animations are disabled, just render children directly
  if (animationDuration === 0 || !animation) {
    return <View>{children}</View>;
  }

  // Otherwise, render with animation
  // For MVP, we'll keep this simple and add animations later
  return <View>{children}</View>;
}
