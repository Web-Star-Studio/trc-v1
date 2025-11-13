// Profile Edit Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhotoPicker } from '@/components/profile/PhotoPicker';
import { supabase } from '@/lib/supabase';
import { useMutation } from '@tanstack/react-query';

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

export default function ProfileEditScreen() {
  const { theme } = useTheme();
  const { triggerHaptic } = useSensory();
  const { profile, refreshProfile, user } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [pronouns, setPronouns] = useState(profile?.pronouns || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [photos, setPhotos] = useState<string[]>(profile?.photos || []);
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setPronouns(profile.pronouns || '');
      setBio(profile.bio || '');
      setPhotos(profile.photos || []);
      setInterests(profile.interests || []);
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          pronouns: pronouns.trim() || null,
          bio: bio.trim() || null,
          photos,
          interests,
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      triggerHaptic('success');
      await refreshProfile();
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      triggerHaptic('error');
      Alert.alert('Error', error.message || 'Failed to update profile');
    },
  });

  const toggleInterest = (interest: string) => {
    triggerHaptic('light');
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      if (interests.length >= 10) {
        Alert.alert('Limit Reached', 'You can select up to 10 interests');
        return;
      }
      setInterests([...interests, interest]);
    }
  };

  const handleSave = () => {
    if (!displayName.trim()) {
      Alert.alert('Required', 'Display name is required');
      return;
    }

    if (interests.length < 3) {
      Alert.alert('Required', 'Please select at least 3 interests');
      return;
    }

    updateProfileMutation.mutate();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('light');
            router.back();
          }}
          style={styles.backButton}
        >
          <Text style={{ fontSize: 24, color: theme.colors.primary }}>‹</Text>
        </TouchableOpacity>
        <Text
          style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.semibold,
            flex: 1,
          }}
        >
          Edit Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <PhotoPicker photos={photos} onPhotosChange={setPhotos} />

        <View style={{ marginTop: theme.spacing.xl }}>
          <Input
            label="Display Name"
            placeholder="What should we call you?"
            value={displayName}
            onChangeText={setDisplayName}
            required
            maxLength={50}
            containerStyle={{ marginBottom: theme.spacing.md }}
          />

          <Input
            label="Pronouns"
            placeholder="e.g., they/them, she/her, he/him"
            value={pronouns}
            onChangeText={setPronouns}
            maxLength={30}
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
            containerStyle={{ marginBottom: theme.spacing.xl }}
            style={{ height: 100, textAlignVertical: 'top' }}
          />

          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.sizes.md,
              fontWeight: theme.typography.weights.semibold,
              marginBottom: theme.spacing.sm,
            }}
          >
            Interests
          </Text>

          <Text
            style={{
              color: theme.colors.primary,
              fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.semibold,
              marginBottom: theme.spacing.md,
            }}
          >
            {interests.length} / 10 selected (min 3)
          </Text>

          <View style={styles.interestsGrid}>
            {INTEREST_OPTIONS.map((interest) => {
              const isSelected = interests.includes(interest);
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
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
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
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={updateProfileMutation.isPending}
          disabled={updateProfileMutation.isPending}
          style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing['2xl'] }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    paddingRight: 12,
  },
  scrollContent: {
    padding: 24,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    // Styles applied dynamically
  },
});
