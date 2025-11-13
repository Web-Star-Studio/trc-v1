// Onboarding Step 3: Interests & Topics
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

// Predefined interests for MVP
const INTEREST_OPTIONS = [
  '🎨 Art & Creativity',
  '📚 Reading & Books',
  '🎮 Gaming',
  '🎵 Music',
  '🎬 Movies & TV',
  '🏃 Fitness & Sports',
  '🌱 Nature & Outdoors',
  '🍳 Cooking & Food',
  '✈️ Travel',
  '💻 Technology',
  '🧘 Mindfulness & Wellness',
  '🐾 Animals & Pets',
  '🎭 Theater & Performance',
  '📸 Photography',
  '✍️ Writing',
  '🔬 Science',
  '🎨 Crafts & DIY',
  '🎲 Board Games & Puzzles',
  '🌍 Social Justice',
  '🎓 Learning & Education',
];

export default function OnboardingInterestsScreen() {
  const { theme } = useTheme();
  const { user, refreshProfile } = useAuth();
  const { triggerHaptic } = useSensory();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    triggerHaptic('light');
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      if (selectedInterests.length >= 10) {
        Alert.alert('Limit Reached', 'You can select up to 10 interests');
        return;
      }
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleComplete = async () => {
    if (selectedInterests.length < 3) {
      Alert.alert('Select More', 'Please select at least 3 interests to continue');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to continue');
      return;
    }

    setLoading(true);
    try {
      // Update profile with interests and mark onboarding as complete
      const { error } = await supabase
        .from('profiles')
        .update({
          interests: selectedInterests,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile in context
      await refreshProfile();

      triggerHaptic('success');

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Interests save error:', error);
      Alert.alert('Error', error.message || 'Failed to save interests');
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
          STEP 3 OF 3
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
          What are you into?
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.text.secondary,
              fontSize: theme.typography.sizes.md,
              marginBottom: theme.spacing.sm,
              lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.md,
            },
          ]}
        >
          Select at least 3 interests. This helps us find better matches for you.
        </Text>

        <Text
          style={{
            color: theme.colors.primary,
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.semibold,
            marginBottom: theme.spacing.xl,
          }}
        >
          {selectedInterests.length} / 10 selected
        </Text>

        <View style={styles.interestsGrid}>
          {INTEREST_OPTIONS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                onPress={() => toggleInterest(interest)}
                style={[
                  styles.interestChip,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.surfaceVariant,
                    borderWidth: 2,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    borderRadius: theme.borderRadius.full,
                    paddingVertical: theme.spacing.sm,
                    paddingHorizontal: theme.spacing.md,
                    marginRight: theme.spacing.sm,
                    marginBottom: theme.spacing.sm,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={interest}
                accessibilityHint={
                  isSelected ? 'Double tap to deselect' : 'Double tap to select'
                }
              >
                <Text
                  style={{
                    color: isSelected ? theme.colors.onPrimary : theme.colors.text.primary,
                    fontSize: theme.typography.sizes.sm,
                    fontWeight: theme.typography.weights.medium,
                  }}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title="Complete Setup"
          onPress={handleComplete}
          loading={loading}
          disabled={loading || selectedInterests.length < 3}
          accessibilityHint="Complete onboarding and go to main app"
          style={{ marginTop: theme.spacing.xl }}
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
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestChip: {
    // Styles applied dynamically
  },
});
