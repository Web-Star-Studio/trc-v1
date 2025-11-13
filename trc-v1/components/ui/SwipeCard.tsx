// Swipeable Card Component for Tinder-style matching
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/lib/context/ThemeContext';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.7;
const CARD_WIDTH = width * 0.9;

interface SwipeCardProps {
  profile: {
    display_name: string;
    pronouns?: string;
    bio?: string;
    photos: string[];
    interests: string[];
    match_score?: number;
    distance_km?: number;
  };
}

export function SwipeCard({ profile }: SwipeCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          ...theme.shadows.xl,
        },
      ]}
    >
      {/* Photo */}
      <View style={styles.photoContainer}>
        {profile.photos && profile.photos.length > 0 ? (
          <Image source={{ uri: profile.photos[0] }} style={styles.photo} />
        ) : (
          <View
            style={[
              styles.photoPlaceholder,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Text style={{ fontSize: 80 }}>👤</Text>
          </View>
        )}

        {/* Gradient overlay */}
        <View style={styles.gradient} />
      </View>

      {/* Info */}
      <View style={[styles.info, { padding: theme.spacing.lg }]}>
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.name,
              {
                color: theme.colors.text.primary,
                fontSize: theme.typography.sizes['3xl'],
                fontWeight: theme.typography.weights.bold,
              },
            ]}
          >
            {profile.display_name}
          </Text>
          {profile.pronouns && (
            <Text
              style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.sizes.md,
                marginLeft: theme.spacing.sm,
                marginTop: 4,
              }}
            >
              ({profile.pronouns})
            </Text>
          )}
        </View>

        {profile.distance_km !== null && profile.distance_km !== undefined && (
          <Text
            style={{
              color: theme.colors.text.tertiary,
              fontSize: theme.typography.sizes.sm,
              marginTop: theme.spacing.xs,
            }}
          >
            📍 ~{Math.round(profile.distance_km)} km away
          </Text>
        )}

        {profile.match_score !== null && profile.match_score !== undefined && (
          <View
            style={[
              styles.matchBadge,
              {
                backgroundColor: theme.colors.primary + '20',
                borderRadius: theme.borderRadius.full,
                paddingVertical: theme.spacing.xs,
                paddingHorizontal: theme.spacing.sm,
                marginTop: theme.spacing.sm,
              },
            ]}
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: theme.typography.sizes.sm,
                fontWeight: theme.typography.weights.bold,
              }}
            >
              {Math.round(profile.match_score)}% Match
            </Text>
          </View>
        )}

        {profile.bio && (
          <Text
            numberOfLines={3}
            style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.sizes.md,
              lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.md,
              marginTop: theme.spacing.md,
            }}
          >
            {profile.bio}
          </Text>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <View style={{ marginTop: theme.spacing.md }}>
            <View style={styles.interestsGrid}>
              {profile.interests.slice(0, 5).map((interest, index) => (
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    overflow: 'hidden',
  },
  photoContainer: {
    width: '100%',
    height: CARD_HEIGHT * 0.6,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  name: {
    // Styles applied dynamically
  },
  matchBadge: {
    alignSelf: 'flex-start',
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
