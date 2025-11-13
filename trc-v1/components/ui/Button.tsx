// Accessible Button Component with Sensory Support
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
  testID?: string;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ButtonProps) {
  const { theme } = useTheme();
  const { triggerHaptic } = useSensory();

  const handlePress = () => {
    triggerHaptic('light');
    onPress();
  };

  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (isDisabled) return theme.colors.border;
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.surfaceVariant;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (isDisabled) return theme.colors.text.tertiary;
    switch (variant) {
      case 'primary':
        return theme.colors.onPrimary;
      case 'secondary':
        return theme.colors.text.primary;
      case 'outline':
      case 'ghost':
        return theme.colors.primary;
      default:
        return theme.colors.onPrimary;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return isDisabled ? theme.colors.border : theme.colors.primary;
    }
    return 'transparent';
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md };
      case 'lg':
        return { paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.xl };
      case 'md':
      default:
        return { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return theme.typography.sizes.sm;
      case 'lg':
        return theme.typography.sizes.lg;
      case 'md':
      default:
        return theme.typography.sizes.md;
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 2 : 0,
          borderRadius: theme.borderRadius.md,
          opacity: isDisabled ? 0.6 : 1,
          ...getPadding(),
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getFontSize(),
              fontWeight: theme.typography.weights.semibold,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // iOS minimum touch target
  },
  text: {
    textAlign: 'center',
  },
});
