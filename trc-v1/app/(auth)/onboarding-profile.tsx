// Onboarding Step 1: Basic Profile Setup
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';

export default function OnboardingProfileScreen() {
  const { theme } = useTheme();
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [bio, setBio] = useState('');

  const handleContinue = async () => {
    if (!displayName.trim()) {
      Alert.alert('Required', 'Please enter your display name');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to continue');
      return;
    }

    setLoading(true);
    try {
      // Create or update profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName.trim(),
          pronouns: pronouns.trim() || null,
          bio: bio.trim() || null,
          onboarding_completed: false, // Will be true after all steps
        });

      if (error) throw error;

      // Refresh profile in context
      await refreshProfile();

      // Navigate to next onboarding step
      router.push('/(auth)/onboarding-sensory');
    } catch (error: any) {
      console.error('Profile creation error:', error);
      Alert.alert('Error', error.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

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
          STEP 1 OF 3
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
          Let's get to know you
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
          Tell us a bit about yourself. You can always update this later.
        </Text>

        <Input
          label="Display Name"
          placeholder="What should we call you?"
          value={displayName}
          onChangeText={setDisplayName}
          required
          maxLength={50}
          accessibilityLabel="Display name"
          accessibilityHint="Enter the name you want others to see"
          containerStyle={{ marginBottom: theme.spacing.md }}
        />

        <Input
          label="Pronouns"
          placeholder="e.g., they/them, she/her, he/him"
          value={pronouns}
          onChangeText={setPronouns}
          maxLength={30}
          accessibilityLabel="Pronouns"
          accessibilityHint="Optional: Enter your pronouns"
          containerStyle={{ marginBottom: theme.spacing.md }}
        />

        <Input
          label="Bio"
          placeholder="Tell us about yourself..."
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          maxLength={500}
          accessibilityLabel="Bio"
          accessibilityHint="Optional: Write a short bio about yourself"
          containerStyle={{ marginBottom: theme.spacing.xl }}
          style={{ height: 100, textAlignVertical: 'top' }}
        />

        <Button
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          disabled={loading || !displayName.trim()}
          accessibilityHint="Continue to sensory preferences"
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
});
