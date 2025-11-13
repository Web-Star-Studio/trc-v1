// Profile Card Component for Discovery Feed
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/lib/context/ThemeContext';
import { CandidateProfile } from '@/types';

interface ProfileCardProps {
  profile: CandidateProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const primaryPhoto = profile.photos[0];
  const sharedInterests = profile.interests.slice(0, 3);

  return (
    <Card
      onPress={() => router.push(`/profile/${profile.id}`)}
      accessibilityLabel={`${profile.displayName}'s profile. ${profile.matchScore}% match.`}
      accessibilityHint="Double tap to view full profile"
      style={styles.container}
    >
      {primaryPhoto && (
        <Image
          source={{ uri: primaryPhoto }}
          style={[
            styles.photo,
            { borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.surface },
          ]}
          accessibilityIgnoresInvertColors
        />
      )}

      <View style={{ padding: theme.spacing.md }}>
        <View style={styles.header}>
          <Text
            style={[
              styles.name,
              {
                color: theme.colors.text,
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight as any,
              },
            ]}
            numberOfLines={1}
          >
            {profile.displayName}
            {profile.pronouns && (
              <Text
                style={[
                  styles.pronouns,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.body.fontSize,
                    fontWeight: '400',
                  },
                ]}
              >
                {' '}
                ({profile.pronouns})
              </Text>
            )}
          </Text>
          {profile.distanceKm && (
            <Text
              style={[
                styles.distance,
                { color: theme.colors.textSecondary, fontSize: theme.typography.caption.fontSize },
              ]}
            >
              {Math.round(profile.distanceKm)} km away
            </Text>
          )}
        </View>

        {profile.bio && (
          <Text
            style={[
              styles.bio,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.body.fontSize,
                marginTop: theme.spacing.xs,
              },
            ]}
            numberOfLines={2}
          >
            {profile.bio}
          </Text>
        )}

        {sharedInterests.length > 0 && (
          <View style={[styles.interestsContainer, { marginTop: theme.spacing.sm }]}>
            {sharedInterests.map((interest, index) => (
              <View
                key={index}
                style={[
                  styles.interestTag,
                  {
                    backgroundColor: theme.colors.primaryLight,
                    borderRadius: theme.borderRadius.full,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs / 2,
                    marginRight: theme.spacing.xs,
                    marginBottom: theme.spacing.xs,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.interestText,
                    {
                      color: theme.colors.primary,
                      fontSize: theme.typography.caption.fontSize,
                    },
                  ]}
                >
                  {interest}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View
          style={[
            styles.matchScore,
            {
              backgroundColor: theme.colors.success,
              borderRadius: theme.borderRadius.full,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs / 2,
              marginTop: theme.spacing.sm,
              alignSelf: 'flex-start',
            },
          ]}
        >
          <Text style={[styles.matchScoreText, { color: '#FFFFFF' }]}>
            {profile.matchScore}% Match
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
  },
  pronouns: {},
  distance: {},
  bio: {
    lineHeight: 22,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {},
  interestText: {},
  matchScore: {},
  matchScoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
