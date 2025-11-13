// Card Component for grouping content
import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
  onPress?: () => void;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Card({
  children,
  style,
  variant = 'elevated',
  onPress,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const { theme } = useTheme();
  const { triggerHaptic } = useSensory();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...theme.shadows.md,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surfaceVariant,
        };
      default:
        return baseStyle;
    }
  };

  const handlePress = () => {
    if (onPress) {
      triggerHaptic('light');
      onPress();
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[getCardStyle(), style]}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]} testID={testID} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}
