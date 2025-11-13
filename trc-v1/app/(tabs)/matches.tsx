// Matches Screen - View all matches and start conversations
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';
import { Card } from '@/components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/context/AuthContext';

export default function MatchesScreen() {
  const { theme } = useTheme();
  const { triggerHaptic } = useSensory();
  const { user } = useAuth();
  const router = useRouter();

  // Fetch matches
  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      // Get all matches where user is either user_a or user_b
      const { data, error } = await supabase
        .from('matches')
        .select(
          `
          id,
          user_a,
          user_b,
          score,
          created_at,
          status
        `
        )
        .eq('status', 'mutual')
        .or(`user_a.eq.${user!.id},user_b.eq.${user!.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for matched users
      const matchesWithProfiles = await Promise.all(
        (data || []).map(async (match) => {
          const otherUserId = match.user_a === user!.id ? match.user_b : match.user_a;

          const { data: profile } = await supabase
            .from('profiles')
            .select('id, display_name, pronouns, bio, photos, interests')
            .eq('id', otherUserId)
            .single();

          return {
            ...match,
            profile,
          };
        })
      );

      return matchesWithProfiles;
    },
    enabled: !!user,
  });

  const handleMatchPress = async (match: any) => {
    triggerHaptic('light');

    // Get or create conversation for this match
    try {
      // Find existing conversation between these users
      const { data: participantData } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user!.id);

      const userConversations = participantData?.map((p) => p.conversation_id) || [];

      if (userConversations.length > 0) {
        // Check which conversation has the other user
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', match.profile.id)
          .in('conversation_id', userConversations)
          .limit(1)
          .single();

        if (otherParticipant) {
          // Conversation exists, navigate to it
          router.push(`/chat/${otherParticipant.conversation_id}`);
          return;
        }
      }

      // No existing conversation, create one
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

      // Add both participants
      const { error: participantsError } = await supabase.from('conversation_participants').insert([
        { conversation_id: newConversation.id, user_id: user!.id },
        { conversation_id: newConversation.id, user_id: match.profile.id },
      ]);

      if (participantsError) throw participantsError;

      // Navigate to new conversation
      router.push(`/chat/${newConversation.id}`);
    } catch (error) {
      console.error('Error opening chat:', error);
      Alert.alert('Error', 'Failed to open chat. Please try again.');
    }
  };

  const renderMatch = ({ item }: { item: any }) => {
    const profile = item.profile;
    if (!profile) return null;

    return (
      <Card
        variant="outlined"
        onPress={() => handleMatchPress(item)}
        style={{ marginBottom: theme.spacing.md }}
      >
        <View style={styles.matchCard}>
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
              <Text style={{ fontSize: 32 }}>👤</Text>
            )}
          </View>

          <View style={styles.matchInfo}>
            <View style={styles.matchHeader}>
              <Text
                style={{
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.sizes.lg,
                  fontWeight: theme.typography.weights.semibold,
                }}
              >
                {profile.display_name}
              </Text>
              {profile.pronouns && (
                <Text
                  style={{
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.sizes.sm,
                    marginLeft: theme.spacing.xs,
                  }}
                >
                  ({profile.pronouns})
                </Text>
              )}
            </View>

            {profile.bio && (
              <Text
                numberOfLines={2}
                style={{
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.sizes.sm,
                  marginTop: theme.spacing.xs,
                }}
              >
                {profile.bio}
              </Text>
            )}

            {item.score && (
              <Text
                style={{
                  color: theme.colors.primary,
                  fontSize: theme.typography.sizes.xs,
                  fontWeight: theme.typography.weights.semibold,
                  marginTop: theme.spacing.xs,
                }}
              >
                {Math.round(item.score)}% Match
              </Text>
            )}
          </View>

          <View style={styles.chevron}>
            <Text style={{ color: theme.colors.text.tertiary, fontSize: 20 }}>›</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          Matches
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.colors.text.secondary }}>Loading matches...</Text>
        </View>
      ) : !matches || matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48, marginBottom: theme.spacing.md }}>💜</Text>
          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.sizes.xl,
              fontWeight: theme.typography.weights.bold,
              marginBottom: theme.spacing.sm,
            }}
          >
            No matches yet
          </Text>
          <Text
            style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.sizes.md,
              textAlign: 'center',
              paddingHorizontal: theme.spacing.xl,
            }}
          >
            Start liking profiles in the Discover tab to find your matches!
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatch}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
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
  listContent: {
    padding: 24,
    paddingTop: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  matchInfo: {
    flex: 1,
    marginLeft: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: 8,
  },
});
