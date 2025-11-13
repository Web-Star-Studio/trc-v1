// Chat Conversation Screen - Individual chat with real-time messages
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useSafetyActions } from '@/components/profile/SafetyActions';

export default function ChatConversationScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { triggerHaptic } = useSensory();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const [messageText, setMessageText] = useState('');

  // Safety actions
  const safetyActions = useSafetyActions({
    targetUserId: otherUser?.id || '',
    targetUserName: otherUser?.display_name || '',
  });

  // Get other participant's profile
  const { data: otherUser } = useQuery({
    queryKey: ['conversation-user', conversationId],
    queryFn: async () => {
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .neq('user_id', user!.id)
        .limit(1);

      const otherUserId = participants?.[0]?.user_id;
      if (!otherUserId) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      return profile;
    },
    enabled: !!conversationId && !!user,
  });

  // Get messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!conversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId!,
          sender_id: user!.id,
          text: text.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;
    },
    onSuccess: () => {
      setMessageText('');
      triggerHaptic('light');
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
  });

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Add new message to cache
          queryClient.setQueryData(['messages', conversationId], (old: any) => {
            if (!old) return [payload.new];
            return [...old, payload.new];
          });

          // Scroll to bottom
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);

          // Trigger haptic if message is from other user
          if (payload.new.sender_id !== user?.id) {
            triggerHaptic('light');
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, user?.id]);

  // Update last_read_at when viewing conversation
  useEffect(() => {
    if (!conversationId || !user) return;

    const updateLastRead = async () => {
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
    };

    updateLastRead();
  }, [conversationId, user?.id]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isOwnMessage = item.sender_id === user?.id;
    const prevMessage = index > 0 ? messages?.[index - 1] : null;
    const showTimestamp =
      !prevMessage ||
      new Date(item.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000; // 5 min

    return (
      <View>
        {showTimestamp && (
          <Text
            style={{
              textAlign: 'center',
              color: theme.colors.text.tertiary,
              fontSize: theme.typography.sizes.xs,
              marginVertical: theme.spacing.md,
            }}
          >
            {formatMessageTime(item.created_at)}
          </Text>
        )}
        <View
          style={[styles.messageContainer, isOwnMessage ? styles.ownMessage : styles.otherMessage]}
        >
          <View
            style={[
              styles.messageBubble,
              {
                backgroundColor: isOwnMessage ? theme.colors.primary : theme.colors.surfaceVariant,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.md,
                maxWidth: '80%',
              },
            ]}
          >
            <Text
              style={{
                color: isOwnMessage ? theme.colors.onPrimary : theme.colors.text.primary,
                fontSize: theme.typography.sizes.md,
                lineHeight: theme.typography.lineHeights.normal * theme.typography.sizes.md,
              }}
            >
              {item.text}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.colors.text.secondary }}>Loading conversation...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
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

        {otherUser && (
          <View style={styles.headerInfo}>
            <View
              style={[
                styles.headerAvatar,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: theme.borderRadius.full,
                },
              ]}
            >
              {otherUser.photos && otherUser.photos.length > 0 ? (
                <Image source={{ uri: otherUser.photos[0] }} style={styles.headerAvatarImage} />
              ) : (
                <Text style={{ fontSize: 20 }}>👤</Text>
              )}
            </View>
            <Text
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.sizes.lg,
                fontWeight: theme.typography.weights.semibold,
              }}
            >
              {otherUser.display_name}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => {
            triggerHaptic('light');
            Alert.alert('Safety Options', `What would you like to do?`, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Report User',
                onPress: () => safetyActions.showReportDialog(),
              },
              {
                text: 'Block User',
                style: 'destructive',
                onPress: () => safetyActions.showBlockConfirmation(),
              },
            ]);
          }}
          style={{ paddingLeft: 12 }}
        >
          <Text style={{ fontSize: 20 }}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 48, marginBottom: theme.spacing.md }}>💜</Text>
            <Text
              style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.sizes.md,
                textAlign: 'center',
              }}
            >
              Start your conversation!
            </Text>
          </View>
        }
      />

      {/* Input Area */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: theme.borderRadius.full,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              fontSize: theme.typography.sizes.md,
              color: theme.colors.text.primary,
              flex: 1,
            },
          ]}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.text.tertiary}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!messageText.trim() || sendMessageMutation.isPending}
          style={[
            styles.sendButton,
            {
              backgroundColor: messageText.trim() ? theme.colors.primary : theme.colors.border,
              borderRadius: theme.borderRadius.full,
              marginLeft: theme.spacing.sm,
            },
          ]}
        >
          <Text style={{ fontSize: 20 }}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  headerAvatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  messageContainer: {
    marginBottom: 8,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    // Styles applied dynamically
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  input: {
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
