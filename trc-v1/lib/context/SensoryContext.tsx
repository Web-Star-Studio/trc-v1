import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SensorySettings {
  motionOk: boolean;
  highContrast: boolean;
  hapticsOk: boolean;
  contentFilters: {
    flashingLights: boolean;
    loudSounds: boolean;
  };
}

interface SensoryContextValue {
  settings: SensorySettings;
  updateSettings: (updates: Partial<SensorySettings>) => Promise<void>;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
  getAnimationDuration: (duration: number) => number;
  loading: boolean;
}

const defaultSettings: SensorySettings = {
  motionOk: true,
  highContrast: false,
  hapticsOk: true,
  contentFilters: {
    flashingLights: false,
    loudSounds: false,
  },
};

const SensoryContext = createContext<SensoryContextValue | undefined>(undefined);

const STORAGE_KEY = '@sensory_settings';

interface SensoryProviderProps {
  children: ReactNode;
}

export function SensoryProvider({ children }: SensoryProviderProps) {
  const [settings, setSettings] = useState<SensorySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load sensory settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<SensorySettings>) => {
    try {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save sensory settings:', error);
    }
  };

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    if (!settings.hapticsOk) return;

    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      // Haptics may not be available on all devices
      console.debug('Haptics not available:', error);
    }
  };

  const getAnimationDuration = (duration: number): number => {
    // Return 0 if motion is disabled (reduced motion)
    return settings.motionOk ? duration : 0;
  };

  return (
    <SensoryContext.Provider
      value={{
        settings,
        updateSettings,
        triggerHaptic,
        getAnimationDuration,
        loading,
      }}
    >
      {children}
    </SensoryContext.Provider>
  );
}

export function useSensory() {
  const context = useContext(SensoryContext);
  if (!context) {
    throw new Error('useSensory must be used within SensoryProvider');
  }
  return context;
}
