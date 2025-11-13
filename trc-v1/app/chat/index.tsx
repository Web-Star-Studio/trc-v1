// Chat List Screen - All conversations
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';
import { Card } from '@/components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/context/AuthContext';

export default function ChatListScreen() {
  const { theme } = useTheme();
  const { triggerHaptic } = useSensory();
  const { user } = useAuth();
  const router = useRouter();

  // Fetch conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      // Get conversations where user is a participant
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, last_read_at')
        .eq('user_id', user!.id);

      if (participantError) throw participantError;

      const conversationIds = participantData?.map((p) => p.conversation_id) || [];

      if (conversationIds.length === 0) {
        return [];
      }

      // Get conversation details
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // For each conversation, get the other participant's profile and last message
      const conversationsWithDetails = await Promise.all(
        (conversations || []).map(async (conversation) => {
          // Get other participant
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversation.id)
            .neq('user_id', user!.id)
            .limit(1);

          const otherUserId = participants?.[0]?.user_id;

          if (!otherUserId) return null;

          // Get other user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, display_name, photos')
            .eq('id', otherUserId)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('text, created_at, sender_id')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Check unread count
          const participantInfo = participantData?.find(
            (p) => p.conversation_id === conversation.id
          );
          const lastReadAt = participantInfo?.last_read_at;

          let unreadCount = 0;
          if (lastReadAt && lastMessage) {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conversation.id)
              .neq('sender_id', user!.id)
              .gt('created_at', lastReadAt);

            unreadCount = count || 0;
          }

          return {
            ...conversation,
            profile,
            lastMessage,
            unreadCount,
          };
        })
      );

      return conversationsWithDetails.filter(Boolean);
    },
    enabled: !!user,
    refetchInterval: 5000, // Refetch every 5 seconds for new messages
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const renderConversation = ({ item }: { item: any }) => {
    if (!item.profile) return null;

    return (
      <Card
        variant="outlined"
        onPress={() => {
          triggerHaptic('light');
          router.push(`/chat/${item.id}`);
        }}
        style={{ marginBottom: theme.spacing.sm }}
      >
        <View style={styles.conversationCard}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: theme.borderRadius.full,
              },
            ]}
          >
            {item.profile.photos && item.profile.photos.length > 0 ? (
              <Image source={{ uri: item.profile.photos[0] }} style={styles.avatarImage} />
            ) : (
              <Text style={{ fontSize: 24 }}>👤</Text>
            )}
          </View>

          <View style={styles.conversationInfo}>
            <View style={styles.conversationHeader}>
              <Text
                style={{
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.sizes.md,
                  fontWeight: theme.typography.weights.semibold,
                }}
              >
                {item.profile.display_name}
              </Text>
              {item.lastMessage && (
                <Text
                  style={{
                    color: theme.colors.text.tertiary,
                    fontSize: theme.typography.sizes.xs,
                  }}
                >
                  {formatTime(item.lastMessage.created_at)}
                </Text>
              )}
            </View>

            {item.lastMessage && (
              <Text
                numberOfLines={1}
                style={{
                  color: item.unreadCount > 0 ? theme.colors.text.primary : theme.colors.text.secondary,
                  fontSize: theme.typography.sizes.sm,
                  marginTop: theme.spacing.xs,
                  fontWeight: item.unreadCount > 0 ? theme.typography.weights.semibold : theme.typography.weights.regular,
                }}
              >
                {item.lastMessage.sender_id === user?.id ? 'You: ' : ''}
                {item.lastMessage.text}
              </Text>
            )}
          </View>

          {item.unreadCount > 0 && (
            <View
              style={[
                styles.unreadBadge,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.full,
                },
              ]}
            >
              <Text style={{ color: theme.colors.onPrimary, fontSize: 12, fontWeight: 'bold' }}>
                {item.unreadCount}
              </Text>
            </View>
          )}
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
          Messages
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.colors.text.secondary }}>Loading conversations...</Text>
        </View>
      ) : !conversations || conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48, marginBottom: theme.spacing.md }}>💬</Text>
          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.sizes.xl,
              fontWeight: theme.typography.weights.bold,
              marginBottom: theme.spacing.sm,
            }}
          >
            No conversations yet
          </Text>
          <Text
            style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.sizes.md,
              textAlign: 'center',
              paddingHorizontal: theme.spacing.xl,
            }}
          >
            When you match with someone, you can start chatting here!
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
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
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
