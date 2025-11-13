// Group Details Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { analytics } from '@/lib/utils/analytics';
import { getMockGroupById } from '@/lib/mock';

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { triggerHaptic } = useSensory();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch group details
  const { data: group, isLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      // Try mock data first if ID starts with 'mock-'
      if (id?.startsWith('mock-')) {
        const mockGroup = getMockGroupById(id);
        return mockGroup;
      }

      // Otherwise try to fetch from Supabase
      try {
        const { data, error } = await supabase.from('groups').select('*').eq('id', id).single();

        if (error) throw error;
        return data as any;
      } catch (error) {
        // Fallback to mock data on error
        console.log('Using mock data fallback for group');
        return getMockGroupById(id || 'mock-group-1');
      }
    },
    enabled: !!id,
  });

  // Check if user is a member
  const { data: membership } = useQuery({
    queryKey: ['group-membership', id],
    queryFn: async () => {
      // Mock data always returns null (not a member)
      if (id?.startsWith('mock-')) {
        return null;
      }

      try {
        const { data, error } = await supabase
          .from('group_members')
          .select('role, joined_at')
          .eq('group_id', id)
          .eq('user_id', user!.id)
          .maybeSingle();

        if (error) throw error;
        return data as any;
      } catch (error) {
        return null;
      }
    },
    enabled: !!id && !!user,
  });

  // Fetch group members
  const { data: members } = useQuery({
    queryKey: ['group-members', id],
    queryFn: async () => {
      // Use mock data for mock groups
      if (id?.startsWith('mock-')) {
        const mockGroup = getMockGroupById(id);
        return mockGroup.members || [];
      }

      try {
        const { data, error } = await supabase
          .from('group_members')
          .select('user_id, role, profiles(display_name, photos)')
          .eq('group_id', id)
          .order('joined_at', { ascending: true })
          .limit(20);

        if (error) throw error;
        return data as any;
      } catch (error) {
        return [];
      }
    },
    enabled: !!id,
  });

  // Fetch upcoming events from this group
  const { data: upcomingEvents } = useQuery({
    queryKey: ['group-events', id],
    queryFn: async () => {
      // Use mock data for mock groups
      if (id?.startsWith('mock-')) {
        const mockGroup = getMockGroupById(id);
        return mockGroup.upcoming_events || [];
      }

      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('events')
          .select('id, title, starts_at, venue_json')
          .eq('group_id', id)
          .gte('starts_at', now)
          .order('starts_at', { ascending: true })
          .limit(5);

        if (error) throw error;
        return (data || []) as any[];
      } catch (error) {
        return [];
      }
    },
    enabled: !!id,
  });

  // Join group mutation
  const joinMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('group_members').insert({
        group_id: id,
        user_id: user!.id,
        role: 'member',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      triggerHaptic('success');
      analytics.track('group_join', { group_id: id });
      queryClient.invalidateQueries({ queryKey: ['group-membership', id] });
      queryClient.invalidateQueries({ queryKey: ['group-members', id] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      triggerHaptic('error');
      console.error('Error joining group:', error);
    },
  });

  // Leave group mutation
  const leaveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      triggerHaptic('light');
      analytics.track('group_leave', { group_id: id });
      queryClient.invalidateQueries({ queryKey: ['group-membership', id] });
      queryClient.invalidateQueries({ queryKey: ['group-members', id] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      triggerHaptic('error');
      console.error('Error leaving group:', error);
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: '#ef4444', fontSize: theme.typography.sizes.lg }}>
          Group not found
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

  const isMember = !!membership;
  const isAdmin = membership?.role === 'admin';
  const memberCount = members?.length || group.member_count || 0;

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
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
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
        <Text
          style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.semibold,
            flex: 1,
            textAlign: 'center',
            marginHorizontal: theme.spacing.md,
          }}
          numberOfLines={1}
        >
          Group Details
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.lg }}>
          {/* Group Name and Stats */}
          <View style={styles.groupHeader}>
            <View
              style={[
                styles.groupIcon,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.lg,
                  width: 80,
                  height: 80,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: theme.spacing.md,
                },
              ]}
            >
              <Ionicons name="people" size={40} color="#FFFFFF" />
            </View>

            <Text
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.sizes['3xl'],
                fontWeight: theme.typography.weights.bold,
                marginBottom: theme.spacing.xs,
                textAlign: 'center',
              }}
            >
              {group.name}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text
                  style={{
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.sizes.xl,
                    fontWeight: theme.typography.weights.bold,
                  }}
                >
                  {memberCount}
                </Text>
                <Text
                  style={{
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.sizes.sm,
                  }}
                >
                  Members
                </Text>
              </View>

              {group.visibility && (
                <View style={styles.stat}>
                  <View
                    style={[
                      styles.visibilityBadge,
                      {
                        backgroundColor: theme.colors.surfaceVariant,
                        borderRadius: theme.borderRadius.md,
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                      },
                    ]}
                  >
                    <Ionicons
                      name={group.visibility === 'public' ? 'globe-outline' : 'lock-closed-outline'}
                      size={16}
                      color={theme.colors.text.secondary}
                    />
                    <Text
                      style={{
                        color: theme.colors.text.secondary,
                        fontSize: theme.typography.sizes.sm,
                        marginLeft: theme.spacing.xs,
                        textTransform: 'capitalize',
                      }}
                    >
                      {group.visibility}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {group.description && (
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
                  {group.description}
                </Text>
              </View>
            </Card>
          )}

          {/* Tags */}
          {group.tags && group.tags.length > 0 && (
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
                  {group.tags.map((tag: string, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.tag,
                        {
                          backgroundColor: theme.colors.surfaceVariant,
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
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          )}

          {/* Upcoming Events */}
          {upcomingEvents && upcomingEvents.length > 0 && (
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
                  Upcoming Events ({upcomingEvents.length})
                </Text>
                {upcomingEvents.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    onPress={() => router.push(`/event/${event.id}`)}
                    style={[
                      styles.eventItem,
                      {
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.borderRadius.md,
                        padding: theme.spacing.sm,
                        marginBottom: theme.spacing.sm,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: theme.colors.text.primary,
                          fontSize: theme.typography.sizes.md,
                          fontWeight: theme.typography.weights.medium,
                          marginBottom: theme.spacing.xs / 2,
                        }}
                      >
                        {event.title}
                      </Text>
                      <Text
                        style={{
                          color: theme.colors.text.secondary,
                          fontSize: theme.typography.sizes.sm,
                        }}
                      >
                        📅 {formatDate(event.starts_at)}
                      </Text>
                      {event.venue_json?.name && (
                        <Text
                          style={{
                            color: theme.colors.text.tertiary,
                            fontSize: theme.typography.sizes.sm,
                          }}
                        >
                          📍 {event.venue_json.name}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {/* Members */}
          {members && members.length > 0 && (
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
                  Members ({memberCount})
                </Text>
                <View style={styles.membersList}>
                  {members.slice(0, 12).map((member, index) => (
                    <View
                      key={index}
                      style={[
                        styles.memberItem,
                        {
                          marginRight: theme.spacing.sm,
                          marginBottom: theme.spacing.sm,
                          alignItems: 'center',
                        },
                      ]}
                    >
                      {member.profiles?.photos?.[0] ? (
                        <Image
                          source={{ uri: member.profiles.photos[0] }}
                          style={[
                            styles.memberAvatar,
                            {
                              borderRadius: theme.borderRadius.full,
                              backgroundColor: theme.colors.surface,
                              borderWidth: 2,
                              borderColor:
                                member.role === 'admin'
                                  ? theme.colors.primary
                                  : theme.colors.background,
                            },
                          ]}
                        />
                      ) : (
                        <View
                          style={[
                            styles.memberAvatar,
                            {
                              borderRadius: theme.borderRadius.full,
                              backgroundColor: theme.colors.surface,
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderWidth: 2,
                              borderColor:
                                member.role === 'admin'
                                  ? theme.colors.primary
                                  : theme.colors.background,
                            },
                          ]}
                        >
                          <Ionicons name="person" size={20} color={theme.colors.text.tertiary} />
                        </View>
                      )}
                      {member.role === 'admin' && (
                        <View
                          style={[
                            styles.adminBadge,
                            {
                              backgroundColor: theme.colors.primary,
                              borderRadius: theme.borderRadius.full,
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: 18,
                              height: 18,
                              justifyContent: 'center',
                              alignItems: 'center',
                            },
                          ]}
                        >
                          <Ionicons name="star" size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  ))}
                  {memberCount > 12 && (
                    <View
                      style={[
                        styles.memberAvatar,
                        {
                          borderRadius: theme.borderRadius.full,
                          backgroundColor: theme.colors.surface,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderWidth: 2,
                          borderColor: theme.colors.background,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: theme.colors.text.primary,
                          fontSize: theme.typography.sizes.sm,
                          fontWeight: theme.typography.weights.semibold,
                        }}
                      >
                        +{memberCount - 12}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          )}

          {/* Admin Badge for User */}
          {isAdmin && (
            <Card
              variant="filled"
              style={{
                marginTop: theme.spacing.md,
                backgroundColor: theme.colors.surfaceVariant,
              }}
            >
              <View style={[styles.infoRow, { padding: theme.spacing.md }]}>
                <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontSize: theme.typography.sizes.sm,
                    fontWeight: theme.typography.weights.semibold,
                    marginLeft: theme.spacing.sm,
                  }}
                >
                  You're an admin of this group
                </Text>
              </View>
            </Card>
          )}

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Join/Leave Button */}
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
        {isMember ? (
          <Button
            title={isAdmin ? 'Leave Group (Admin)' : 'Leave Group'}
            variant="outline"
            onPress={() => {
              if (isAdmin) {
                // Show warning for admins
                alert('As an admin, leaving will remove your admin privileges.');
              }
              leaveMutation.mutate();
            }}
            loading={leaveMutation.isPending}
            style={{ flex: 1 }}
          />
        ) : (
          <Button
            title="Join Group"
            variant="primary"
            onPress={() => joinMutation.mutate()}
            loading={joinMutation.isPending}
            style={{ flex: 1 }}
          />
        )}
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
  groupHeader: {
    alignItems: 'center',
  },
  groupIcon: {},
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 12,
  },
  stat: {
    alignItems: 'center',
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {},
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  memberItem: {
    position: 'relative',
  },
  memberAvatar: {
    width: 48,
    height: 48,
  },
  adminBadge: {},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
  },
});
