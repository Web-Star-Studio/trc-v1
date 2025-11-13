// Onboarding Step 2: Sensory Preferences
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

export default function OnboardingSensoryScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { settings, updateSettings, triggerHaptic } = useSensory();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [motionOk, setMotionOk] = useState(settings.motionOk);
  const [highContrast, setHighContrast] = useState(settings.highContrast);
  const [hapticsOk, setHapticsOk] = useState(settings.hapticsOk);
  const [flashingLights, setFlashingLights] = useState(settings.contentFilters.flashingLights);
  const [loudSounds, setLoudSounds] = useState(settings.contentFilters.loudSounds);

  const handleToggle = (
    value: boolean,
    setter: (v: boolean) => void,
    hapticType: 'success' | 'warning' = 'success'
  ) => {
    setter(value);
    if (hapticsOk) {
      triggerHaptic(value ? hapticType : 'light');
    }
  };

  const handleContinue = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to continue');
      return;
    }

    setLoading(true);
    try {
      // Save to local storage via context
      await updateSettings({
        motionOk,
        highContrast,
        hapticsOk,
        contentFilters: {
          flashingLights,
          loudSounds,
        },
      });

      // Save to database
      const { error } = await supabase
        .from('sensory_profiles')
        .upsert({
          user_id: user.id,
          motion_ok: motionOk,
          high_contrast: highContrast,
          haptics_ok: hapticsOk,
          content_filters: {
            flashing_lights: flashingLights,
            loud_sounds: loudSounds,
          },
        });

      if (error) throw error;

      // Navigate to next onboarding step
      router.push('/(auth)/onboarding-interests');
    } catch (error: any) {
      console.error('Sensory preferences error:', error);
      Alert.alert('Error', error.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const renderPreference = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (v: boolean) => void,
    icon: string
  ) => (
    <Card
      variant="outlined"
      style={{ marginBottom: theme.spacing.md, padding: theme.spacing.md }}
    >
      <View style={styles.preferenceRow}>
        <View style={styles.preferenceContent}>
          <Text style={styles.preferenceIcon}>{icon}</Text>
          <View style={styles.preferenceText}>
            <Text
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.sizes.md,
                fontWeight: theme.typography.weights.semibold,
                marginBottom: theme.spacing.xs,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.sizes.sm,
                lineHeight: theme.typography.lineHeights.normal * theme.typography.sizes.sm,
              }}
            >
              {description}
            </Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor="#ffffff"
          ios_backgroundColor={theme.colors.border}
        />
      </View>
    </Card>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.step,
            {
              color: theme.colors.primary,
              fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.semibold,
              marginBottom: theme.spacing.sm,
            },
          ]}
        >
          STEP 2 OF 3
        </Text>

        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text.primary,
              fontSize: theme.typography.sizes['3xl'],
              fontWeight: theme.typography.weights.bold,
              marginBottom: theme.spacing.md,
            },
          ]}
        >
          Sensory Preferences
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.text.secondary,
              fontSize: theme.typography.sizes.md,
              marginBottom: theme.spacing['2xl'],
              lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.md,
            },
          ]}
        >
          Customize your experience to be comfortable for you. These settings help us create a
          more accessible app.
        </Text>

        {renderPreference(
          'Animations & Motion',
          'Allow animations and motion effects',
          motionOk,
          (v) => handleToggle(v, setMotionOk),
          '✨'
        )}

        {renderPreference(
          'High Contrast Mode',
          'Increase contrast for better visibility',
          highContrast,
          (v) => handleToggle(v, setHighContrast),
          '🔆'
        )}

        {renderPreference(
          'Haptic Feedback',
          'Feel vibrations when interacting',
          hapticsOk,
          (v) => handleToggle(v, setHapticsOk),
          '📳'
        )}

        <Text
          style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.sizes.md,
            fontWeight: theme.typography.weights.semibold,
            marginTop: theme.spacing.lg,
            marginBottom: theme.spacing.md,
          }}
        >
          Content Filters
        </Text>

        {renderPreference(
          'Filter Flashing Lights',
          'Avoid content with rapid flashing',
          flashingLights,
          (v) => handleToggle(v, setFlashingLights, 'warning'),
          '⚠️'
        )}

        {renderPreference(
          'Filter Loud Sounds',
          'Avoid content with sudden loud noises',
          loudSounds,
          (v) => handleToggle(v, setLoudSounds, 'warning'),
          '🔇'
        )}

        <Button
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          disabled={loading}
          accessibilityHint="Continue to interests"
          style={{ marginTop: theme.spacing.xl }}
        />

        <Button
          title="Skip for Now"
          variant="ghost"
          onPress={() => router.push('/(auth)/onboarding-interests')}
          disabled={loading}
          style={{ marginTop: theme.spacing.md }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  step: {
    // Styles applied dynamically
  },
  title: {
    // Styles applied dynamically
  },
  subtitle: {
    // Styles applied dynamically
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 16,
  },
  preferenceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  preferenceText: {
    flex: 1,
  },
});
