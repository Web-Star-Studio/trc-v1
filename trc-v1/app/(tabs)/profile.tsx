// Profile Screen - View and edit user profile
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { triggerHaptic, settings, updateSettings } = useSensory();
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            triggerHaptic('light');
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.colors.text.secondary }}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.text.primary,
              fontSize: theme.typography.sizes['3xl'],
              fontWeight: theme.typography.weights.bold,
            },
          ]}
        >
          Profile
        </Text>
      </View>

      <View style={styles.content}>
        {/* Profile Card */}
        <Card variant="outlined" style={{ marginBottom: theme.spacing.lg }}>
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: theme.borderRadius.full,
                },
              ]}
            >
              {profile.photos && profile.photos.length > 0 ? (
                <Image source={{ uri: profile.photos[0] }} style={styles.avatarImage} />
              ) : (
                <Text style={{ fontSize: 48 }}>👤</Text>
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text
                style={{
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.sizes['2xl'],
                  fontWeight: theme.typography.weights.bold,
                }}
              >
                {profile.display_name}
              </Text>
              {profile.pronouns && (
                <Text
                  style={{
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.sizes.md,
                    marginTop: theme.spacing.xs,
                  }}
                >
                  {profile.pronouns}
                </Text>
              )}
            </View>
          </View>

          {profile.bio && (
            <Text
              style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.sizes.md,
                marginTop: theme.spacing.md,
                lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.md,
              }}
            >
              {profile.bio}
            </Text>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <View style={{ marginTop: theme.spacing.md }}>
              <Text
                style={{
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.sizes.sm,
                  fontWeight: theme.typography.weights.semibold,
                  marginBottom: theme.spacing.sm,
                }}
              >
                Interests
              </Text>
              <View style={styles.interestsGrid}>
                {profile.interests.map((interest, index) => (
                  <View
                    key={index}
                    style={[
                      styles.interestChip,
                      {
                        backgroundColor: theme.colors.surfaceVariant,
                        borderRadius: theme.borderRadius.full,
                        paddingVertical: theme.spacing.xs,
                        paddingHorizontal: theme.spacing.sm,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: theme.colors.text.primary,
                        fontSize: theme.typography.sizes.xs,
                      }}
                    >
                      {interest}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ marginTop: theme.spacing.md }}>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontSize: theme.typography.sizes.xl,
                    fontWeight: theme.typography.weights.bold,
                  }}
                >
                  {profile.profile_completeness}%
                </Text>
                <Text
                  style={{
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.sizes.xs,
                  }}
                >
                  Complete
                </Text>
              </View>
            </View>
          </View>

          <Button
            title="Edit Profile"
            variant="outline"
            onPress={() => {
              triggerHaptic('light');
              router.push('/profile/edit');
            }}
            style={{ marginTop: theme.spacing.md }}
          />
        </Card>

        {/* Sensory Preferences */}
        <Card variant="outlined" style={{ marginBottom: theme.spacing.lg }}>
          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.sizes.lg,
              fontWeight: theme.typography.weights.bold,
              marginBottom: theme.spacing.md,
            }}
          >
            Accessibility Settings
          </Text>

          <View style={styles.settingRow}>
            <Text style={{ color: theme.colors.text.primary }}>Animations</Text>
            <Text
              style={{
                color: settings.motionOk ? theme.colors.primary : theme.colors.text.tertiary,
              }}
            >
              {settings.motionOk ? 'Enabled' : 'Disabled'}
            </Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={{ color: theme.colors.text.primary }}>High Contrast</Text>
            <Text
              style={{
                color: settings.highContrast ? theme.colors.primary : theme.colors.text.tertiary,
              }}
            >
              {settings.highContrast ? 'On' : 'Off'}
            </Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={{ color: theme.colors.text.primary }}>Haptic Feedback</Text>
            <Text
              style={{
                color: settings.hapticsOk ? theme.colors.primary : theme.colors.text.tertiary,
              }}
            >
              {settings.hapticsOk ? 'Enabled' : 'Disabled'}
            </Text>
          </View>

          <Button
            title="Update Preferences"
            variant="outline"
            onPress={() => {
              triggerHaptic('light');
              Alert.alert('Coming Soon', 'Settings page coming soon!');
            }}
            style={{ marginTop: theme.spacing.md }}
          />
        </Card>

        {/* Account Actions */}
        <Card variant="outlined" style={{ marginBottom: theme.spacing['2xl'] }}>
          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.sizes.lg,
              fontWeight: theme.typography.weights.bold,
              marginBottom: theme.spacing.md,
            }}
          >
            Account
          </Text>

          <Button
            title="Privacy & Safety"
            variant="ghost"
            onPress={() => {
              triggerHaptic('light');
              Alert.alert('Coming Soon', 'Privacy settings coming soon!');
            }}
            style={{ marginBottom: theme.spacing.sm }}
          />

          <Button
            title="Help & Support"
            variant="ghost"
            onPress={() => {
              triggerHaptic('light');
              Alert.alert('Help & Support', 'For help, please email support@ribbonclub.app');
            }}
            style={{ marginBottom: theme.spacing.sm }}
          />

          <Button title="Sign Out" variant="ghost" onPress={handleSignOut} />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    // Styles applied dynamically
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    // Styles applied dynamically
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});
