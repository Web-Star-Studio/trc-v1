// Context Providers - Centralized Export
import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { SensoryProvider } from './SensoryContext';
import { ThemeProvider } from './ThemeContext';

// Export individual providers
export * from './AuthContext';
export * from './SensoryContext';
export * from './ThemeContext';

// Combined App Provider for easy setup
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SensoryProvider>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </SensoryProvider>
  );
}
