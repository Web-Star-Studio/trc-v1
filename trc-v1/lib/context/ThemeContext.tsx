import React, { createContext, useContext, ReactNode } from 'react';
import { lightTheme, highContrastTheme, Theme } from '@/constants/theme';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  isHighContrast: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  highContrast?: boolean;
}

export function ThemeProvider({ children, highContrast = false }: ThemeProviderProps) {
  const theme = highContrast ? highContrastTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: false, // Always light theme for MVP
        isHighContrast: highContrast,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
