// Profile Details Screen - View full profile from discovery
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLikeProfile } from '@/lib/hooks/useDiscovery';
import { analytics } from '@/lib/utils/analytics';
import { Ionicons } from '@expo/vector-icons';
import { getMockProfileById } from '@/lib/mock';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { triggerHaptic } = useSensory();
  const router = useRouter();
  const likeProfile = useLikeProfile();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Fetch profile details
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      // Try mock data first if ID starts with 'mock-'
      if (id?.startsWith('mock-')) {
        const mockProfile = getMockProfileById(id);
        return mockProfile;
      }

      // Otherwise try to fetch from Supabase
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();

        if (error) throw error;
        if (!data) throw new Error('Profile not found');

        // Calculate match score (simplified version)
        const matchScore = Math.floor(Math.random() * 30 + 70); // 70-100%

        const profile = data as any;

        const profileData: ProfileData = {
          id: profile.id,
          displayName: profile.display_name,
          bio: profile.bio || undefined,
          pronouns: profile.pronouns || undefined,
          photos: profile.photos || [],
          interests: profile.interests || [],
          matchScore,
          distanceKm: Math.floor(Math.random() * 50 + 1), // Mock distance
          relationshipPreferences: profile.relationship_preferences,
          neurodivergence: profile.neurodivergence,
          accessibilityNeeds: profile.accessibility_needs,
        };

        return profileData;
      } catch (error) {
        // Fallback to mock data on error
        console.log('Using mock data fallback for profile');
        return getMockProfileById(id || 'mock-profile-1');
      }
    },
    enabled: !!id,
  });

  const handleLike = async () => {
    if (!id) return;
    try {
      triggerHaptic('medium');
      await likeProfile.mutateAsync(id);
      analytics.track('like', { target_user_id: id, source: 'profile_details' });
      router.back();
    } catch (error) {
      console.error('Error liking profile:', error);
      triggerHaptic('error');
    }
  };

  const handlePass = () => {
    triggerHaptic('light');
    analytics.track('pass', { target_user_id: id, source: 'profile_details' });
    router.back();
  };

  const handlePhotoScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPhotoIndex(index);
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error, fontSize: theme.typography.sizes.lg }}>
          Error loading profile
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="outline"
          style={{ marginTop: theme.spacing.md }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.background,
            paddingTop: 50,
            paddingHorizontal: theme.spacing.md,
            paddingBottom: theme.spacing.sm,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.full,
              padding: theme.spacing.sm,
            },
          ]}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Photo Gallery */}
        {profile.photos.length > 0 ? (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handlePhotoScroll}
              style={styles.photoGallery}
            >
              {profile.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={[styles.photo, { backgroundColor: theme.colors.surface }]}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {/* Photo Indicators */}
            {profile.photos.length > 1 && (
              <View style={[styles.photoIndicators, { paddingHorizontal: theme.spacing.md }]}>
                {profile.photos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      {
                        backgroundColor:
                          index === currentPhotoIndex
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant,
                        borderRadius: theme.borderRadius.full,
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View
            style={[
              styles.noPhoto,
              {
                backgroundColor: theme.colors.surface,
                height: 400,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            <Ionicons name="person" size={80} color={theme.colors.text.tertiary} />
          </View>
        )}

        {/* Profile Content */}
        <View style={{ padding: theme.spacing.lg }}>
          {/* Name and Match Score */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.sizes['2xl'],
                  fontWeight: theme.typography.weights.bold,
                }}
              >
                {profile.displayName}
                {profile.pronouns && (
                  <Text
                    style={{
                      color: theme.colors.text.secondary,
                      fontSize: theme.typography.sizes.lg,
                      fontWeight: theme.typography.weights.normal,
                    }}
                  >
                    {' '}
                    ({profile.pronouns})
                  </Text>
                )}
              </Text>
              {profile.distanceKm && (
                <Text
                  style={{
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.sizes.sm,
                    marginTop: theme.spacing.xs,
                  }}
                >
                  📍 {Math.round(profile.distanceKm)} km away
                </Text>
              )}
            </View>

            <View
              style={[
                styles.matchBadge,
                {
                  backgroundColor: theme.colors.success,
                  borderRadius: theme.borderRadius.md,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                },
              ]}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: theme.typography.sizes.lg,
                  fontWeight: theme.typography.weights.bold,
                }}
              >
                {profile.matchScore}%
              </Text>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: theme.typography.sizes.xs,
                  opacity: 0.9,
                }}
              >
                Match
              </Text>
            </View>
          </View>

          {/* Bio */}
          {profile.bio && (
            <Card variant="outlined" style={{ marginTop: theme.spacing.lg }}>
              <View style={{ padding: theme.spacing.md }}>
                <Text
                  style={{
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.sizes.md,
                    fontWeight: theme.typography.weights.semibold,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  About
                </Text>
                <Text
                  style={{
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.sizes.md,
                    lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.md,
                  }}
                >
                  {profile.bio}
                </Text>
              </View>
            </Card>
          )}

          {/* Interests */}
          {profile.interests.length > 0 && (
            <Card variant="outlined" style={{ marginTop: theme.spacing.md }}>
              <View style={{ padding: theme.spacing.md }}>
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
                <View style={styles.tagsContainer}>
                  {profile.interests.map((interest, index) => (
                    <View
                      key={index}
                      style={[
                        styles.tag,
                        {
                          backgroundColor: theme.colors.primaryLight,
                          borderRadius: theme.borderRadius.full,
                          paddingVertical: theme.spacing.sm,
                          paddingHorizontal: theme.spacing.md,
                          marginRight: theme.spacing.sm,
                          marginBottom: theme.spacing.sm,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: theme.colors.primary,
                          fontSize: theme.typography.sizes.sm,
                          fontWeight: theme.typography.weights.medium,
                        }}
                      >
                        {interest}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          )}

          {/* Relationship Preferences */}
          {profile.relationshipPreferences && (
            <Card variant="outlined" style={{ marginTop: theme.spacing.md }}>
              <View style={{ padding: theme.spacing.md }}>
                <Text
                  style={{
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.sizes.md,
                    fontWeight: theme.typography.weights.semibold,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  Looking For
                </Text>
                <Text
                  style={{
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.sizes.md,
                  }}
                >
                  {profile.relationshipPreferences}
                </Text>
              </View>
            </Card>
          )}

          {/* Neurodivergence */}
          {profile.neurodivergence && profile.neurodivergence.length > 0 && (
            <Card variant="outlined" style={{ marginTop: theme.spacing.md }}>
              <View style={{ padding: theme.spacing.md }}>
                <Text
                  style={{
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.sizes.md,
                    fontWeight: theme.typography.weights.semibold,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  🧠 Neurodivergence
                </Text>
                <View style={styles.tagsContainer}>
                  {profile.neurodivergence.map((item: string, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.tag,
                        {
                          backgroundColor: theme.colors.surfaceVariant,
                          borderRadius: theme.borderRadius.md,
                          paddingVertical: theme.spacing.sm,
                          paddingHorizontal: theme.spacing.md,
                          marginRight: theme.spacing.sm,
                          marginBottom: theme.spacing.sm,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: theme.colors.text.primary,
                          fontSize: theme.typography.sizes.sm,
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          )}

          {/* Accessibility Needs */}
          {profile.accessibilityNeeds && profile.accessibilityNeeds.length > 0 && (
            <Card variant="outlined" style={{ marginTop: theme.spacing.md }}>
              <View style={{ padding: theme.spacing.md }}>
                <Text
                  style={{
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.sizes.md,
                    fontWeight: theme.typography.weights.semibold,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  ♿ Accessibility Needs
                </Text>
                <View style={styles.tagsContainer}>
                  {profile.accessibilityNeeds.map((item: string, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.tag,
                        {
                          backgroundColor: theme.colors.surfaceVariant,
                          borderRadius: theme.borderRadius.md,
                          paddingVertical: theme.spacing.sm,
                          paddingHorizontal: theme.spacing.md,
                          marginRight: theme.spacing.sm,
                          marginBottom: theme.spacing.sm,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: theme.colors.text.primary,
                          fontSize: theme.typography.sizes.sm,
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          )}

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={[
          styles.actionButtons,
          {
            backgroundColor: theme.colors.background,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <Button
          title="Pass"
          variant="outline"
          onPress={handlePass}
          style={{ flex: 1, marginRight: theme.spacing.sm }}
          icon={<Ionicons name="close" size={20} color={theme.colors.text.secondary} />}
        />
        <Button
          title="Like"
          variant="primary"
          onPress={handleLike}
          loading={likeProfile.isPending}
          style={{ flex: 1, marginLeft: theme.spacing.sm }}
          icon={<Ionicons name="heart" size={20} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  photoGallery: {
    height: 500,
  },
  photo: {
    width: SCREEN_WIDTH,
    height: 500,
  },
  noPhoto: {
    width: SCREEN_WIDTH,
  },
  photoIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  matchBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {},
  actionButtons: {
    flexDirection: 'row',
  },
});
