// Theme configuration for The Ribbon Club
// Light theme with purple accents

export const colors = {
  // Primary purple palette
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Main brand color
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Neutral grays
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic colors
  success: {
    light: '#dcfce7',
    main: '#10b981',
    dark: '#059669',
  },
  error: {
    light: '#fee2e2',
    main: '#ef4444',
    dark: '#dc2626',
  },
  warning: {
    light: '#fef3c7',
    main: '#f59e0b',
    dark: '#d97706',
  },
  info: {
    light: '#dbeafe',
    main: '#3b82f6',
    dark: '#2563eb',
  },

  // Light theme colors
  light: {
    background: '#ffffff',
    surface: '#fafafa',
    surfaceVariant: '#f5f5f5',
    border: '#e5e5e5',
    text: {
      primary: '#171717',
      secondary: '#525252',
      tertiary: '#a3a3a3',
      inverse: '#ffffff',
    },
    primary: '#a855f7',
    primaryVariant: '#9333ea',
    onPrimary: '#ffffff',
  },

  // High contrast theme (for accessibility)
  highContrast: {
    background: '#ffffff',
    surface: '#ffffff',
    surfaceVariant: '#f5f5f5',
    border: '#000000',
    text: {
      primary: '#000000',
      secondary: '#000000',
      tertiary: '#404040',
      inverse: '#ffffff',
    },
    primary: '#6b21a8',
    primaryVariant: '#581c87',
    onPrimary: '#ffffff',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const typography = {
  // Font families
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

// Animation durations (can be disabled for reduced motion)
export const animations = {
  durations: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easings: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export type Theme = typeof lightTheme;

export const lightTheme = {
  colors: colors.light,
  spacing,
  borderRadius,
  typography,
  shadows,
  animations,
};

export const highContrastTheme = {
  colors: colors.highContrast,
  spacing,
  borderRadius,
  typography,
  shadows,
  animations,
};

export default lightTheme;
