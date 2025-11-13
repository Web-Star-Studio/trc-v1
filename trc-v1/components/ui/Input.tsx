// Accessible Input Component
import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '@/lib/context/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  containerStyle,
  required,
  ...textInputProps
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;
  const borderColor = hasError
    ? theme.colors.text.primary
    : isFocused
      ? theme.colors.primary
      : theme.colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text.primary,
              fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.medium,
              marginBottom: theme.spacing.xs,
            },
          ]}
        >
          {label}
          {required && <Text style={{ color: theme.colors.primary }}> *</Text>}
        </Text>
      )}

      <TextInput
        {...textInputProps}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor,
            borderWidth: 2,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            fontSize: theme.typography.sizes.md,
            color: theme.colors.text.primary,
            minHeight: 48, // Minimum touch target
          },
          textInputProps.style,
        ]}
        placeholderTextColor={theme.colors.text.tertiary}
        onFocus={(e) => {
          setIsFocused(true);
          textInputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          textInputProps.onBlur?.(e);
        }}
        accessibilityLabel={textInputProps.accessibilityLabel || label}
        accessibilityRequired={required}
        accessibilityInvalid={hasError}
      />

      {(error || helperText) && (
        <Text
          style={[
            styles.helperText,
            {
              color: hasError ? theme.colors.text.primary : theme.colors.text.secondary,
              fontSize: theme.typography.sizes.xs,
              marginTop: theme.spacing.xs,
            },
          ]}
          accessibilityLiveRegion={hasError ? 'polite' : 'none'}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    // Styles applied dynamically
  },
  input: {
    // Styles applied dynamically
  },
  helperText: {
    // Styles applied dynamically
  },
});
