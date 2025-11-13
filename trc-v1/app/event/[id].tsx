// Event Details Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
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
import { getMockEventById } from '@/lib/mock';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { triggerHaptic } = useSensory();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch event details
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      // Try mock data first if ID starts with 'mock-'
      if (id?.startsWith('mock-')) {
        const mockEvent = getMockEventById(id);
        return mockEvent;
      }

      // Otherwise try to fetch from Supabase
      try {
        const { data, error } = await supabase
          .from('events')
          .select(
            `
          *,
          host:profiles!events_host_id_fkey(id, display_name, photos),
          group:groups(id, name, member_count)
        `
          )
          .eq('id', id)
          .single();

        if (error) throw error;
        return data as any;
      } catch (error) {
        // Fallback to mock data on error
        console.log('Using mock data fallback for event');
        return getMockEventById(id || 'mock-event-1');
      }
    },
    enabled: !!id,
  });

  // Fetch attendees
  const { data: attendees } = useQuery({
    queryKey: ['event-attendees', id],
    queryFn: async () => {
      // Use mock data for mock events
      if (id?.startsWith('mock-')) {
        const mockEvent = getMockEventById(id);
        return mockEvent.attendees || [];
      }

      try {
        const { data, error } = await supabase
          .from('rsvps')
          .select('user_id, status, profiles(display_name, photos)')
          .eq('event_id', id)
          .eq('status', 'going')
          .order('created_at', { ascending: true })
          .limit(20);

        if (error) throw error;
        return data as any;
      } catch (error) {
        // Fallback to empty array
        return [];
      }
    },
    enabled: !!id,
  });

  // Check user's RSVP status
  const { data: userRsvp } = useQuery({
    queryKey: ['user-rsvp', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rsvps')
        .select('status')
        .eq('event_id', id)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return data?.status || null;
    },
    enabled: !!id && !!user,
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async (status: 'going' | 'declined') => {
      const { data, error } = await supabase.rpc('rsvp_event', {
        p_event_id: id,
        p_status: status,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.waitlist_position) {
        triggerHaptic('warning');
        alert(`You've been added to the waitlist (Position: ${data.waitlist_position})`);
      } else {
        triggerHaptic('success');
      }
      analytics.track('event_rsvp', { event_id: id });
      queryClient.invalidateQueries({ queryKey: ['user-rsvp', id] });
      queryClient.invalidateQueries({ queryKey: ['event-attendees', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: () => {
      triggerHaptic('error');
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    };
  };

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error, fontSize: theme.typography.sizes.lg }}>
          Event not found
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

  const dateInfo = formatDate(event.starts_at);
  const duration = event.ends_at ? formatDuration(event.starts_at, event.ends_at) : null;
  const isGoing = userRsvp === 'going';
  const isWaitlist = userRsvp === 'waitlist';
  const attendeeCount = attendees?.length || 0;

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
          Event Details
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.lg }}>
          {/* Title */}
          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.sizes['3xl'],
              fontWeight: theme.typography.weights.bold,
              marginBottom: theme.spacing.md,
            }}
          >
            {event.title}
          </Text>

          {/* Date & Time Card */}
          <Card variant="filled" style={{ marginBottom: theme.spacing.md }}>
            <View style={{ padding: theme.spacing.md }}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                  <Text
                    style={{
                      color: theme.colors.text.primary,
                      fontSize: theme.typography.sizes.md,
                      fontWeight: theme.typography.weights.semibold,
                    }}
                  >
                    {dateInfo.date}
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.text.secondary,
                      fontSize: theme.typography.sizes.sm,
                      marginTop: theme.spacing.xs / 2,
                    }}
                  >
                    {dateInfo.time}
                    {duration && ` • ${duration}`}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Location Card */}
          {event.venue_json?.name && (
            <Card variant="filled" style={{ marginBottom: theme.spacing.md }}>
              <View style={{ padding: theme.spacing.md }}>
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={24} color={theme.colors.primary} />
                  <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                    <Text
                      style={{
                        color: theme.colors.text.primary,
                        fontSize: theme.typography.sizes.md,
                        fontWeight: theme.typography.weights.semibold,
                      }}
                    >
                      {event.venue_json.name}
                    </Text>
                    {event.venue_json.address && (
                      <Text
                        style={{
                          color: theme.colors.text.secondary,
                          fontSize: theme.typography.sizes.sm,
                          marginTop: theme.spacing.xs / 2,
                        }}
                      >
                        {event.venue_json.address}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </Card>
          )}

          {/* Host & Group Info */}
          <Card variant="outlined" style={{ marginBottom: theme.spacing.md }}>
            <View style={{ padding: theme.spacing.md }}>
              {event.host && (
                <View style={[styles.infoRow, { marginBottom: theme.spacing.sm }]}>
                  {event.host.photos?.[0] ? (
                    <Image
                      source={{ uri: event.host.photos[0] }}
                      style={[
                        styles.avatar,
                        {
                          borderRadius: theme.borderRadius.full,
                          backgroundColor: theme.colors.surface,
                        },
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.avatar,
                        {
                          borderRadius: theme.borderRadius.full,
                          backgroundColor: theme.colors.surface,
                          justifyContent: 'center',
                          alignItems: 'center',
                        },
                      ]}
                    >
                      <Ionicons name="person" size={20} color={theme.colors.text.tertiary} />
                    </View>
                  )}
                  <View style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
                    <Text
                      style={{
                        color: theme.colors.text.secondary,
                        fontSize: theme.typography.sizes.xs,
                      }}
                    >
                      Hosted by
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.text.primary,
                        fontSize: theme.typography.sizes.md,
                        fontWeight: theme.typography.weights.medium,
                      }}
                    >
                      {event.host.display_name}
                    </Text>
                  </View>
                </View>
              )}

              {event.group && (
                <View style={styles.infoRow}>
                  <Ionicons name="people" size={20} color={theme.colors.text.secondary} />
                  <View style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
                    <Text
                      style={{
                        color: theme.colors.text.secondary,
                        fontSize: theme.typography.sizes.xs,
                      }}
                    >
                      Group
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.text.primary,
                        fontSize: theme.typography.sizes.md,
                        fontWeight: theme.typography.weights.medium,
                      }}
                    >
                      {event.group.name}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Card>

          {/* Description */}
          {event.description && (
            <Card variant="outlined" style={{ marginBottom: theme.spacing.md }}>
              <View style={{ padding: theme.spacing.md }}>
                <Text
                  style={{
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.sizes.md,
                    fontWeight: theme.typography.weights.semibold,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  About this event
                </Text>
                <Text
                  style={{
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.sizes.md,
                    lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.md,
                  }}
                >
                  {event.description}
                </Text>
              </View>
            </Card>
          )}

          {/* Accessibility Info */}
          {event.accessibility_notes && (
            <Card
              variant="filled"
              style={{
                marginBottom: theme.spacing.md,
                backgroundColor: theme.colors.surfaceVariant,
              }}
            >
              <View style={{ padding: theme.spacing.md }}>
                <View style={styles.infoRow}>
                  <Text style={{ fontSize: 24 }}>♿</Text>
                  <View style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
                    <Text
                      style={{
                        color: theme.colors.text.primary,
                        fontSize: theme.typography.sizes.sm,
                        fontWeight: theme.typography.weights.semibold,
                        marginBottom: theme.spacing.xs / 2,
                      }}
                    >
                      Accessibility Information
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.text.secondary,
                        fontSize: theme.typography.sizes.sm,
                        lineHeight: theme.typography.lineHeights.normal * theme.typography.sizes.sm,
                      }}
                    >
                      {event.accessibility_notes}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          )}

          {/* Capacity Info */}
          {event.capacity && (
            <Card variant="outlined" style={{ marginBottom: theme.spacing.md }}>
              <View style={{ padding: theme.spacing.md }}>
                <View style={styles.infoRow}>
                  <Ionicons name="people-outline" size={24} color={theme.colors.text.secondary} />
                  <View style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
                    <Text
                      style={{
                        color: theme.colors.text.primary,
                        fontSize: theme.typography.sizes.md,
                      }}
                    >
                      Capacity: {attendeeCount} / {event.capacity} people
                    </Text>
                    {attendeeCount >= event.capacity && (
                      <Text
                        style={{
                          color: theme.colors.warning,
                          fontSize: theme.typography.sizes.sm,
                          marginTop: theme.spacing.xs / 2,
                        }}
                      >
                        Event is full - joining waitlist
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </Card>
          )}

          {/* Attendees */}
          {attendees && attendees.length > 0 && (
            <Card variant="outlined" style={{ marginBottom: theme.spacing.md }}>
              <View style={{ padding: theme.spacing.md }}>
                <Text
                  style={{
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.sizes.md,
                    fontWeight: theme.typography.weights.semibold,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  Attendees ({attendeeCount})
                </Text>
                <View style={styles.attendeesList}>
                  {attendees.slice(0, 10).map((rsvp, index) => (
                    <View key={index} style={{ marginRight: theme.spacing.xs }}>
                      {rsvp.profiles?.photos?.[0] ? (
                        <Image
                          source={{ uri: rsvp.profiles.photos[0] }}
                          style={[
                            styles.attendeeAvatar,
                            {
                              borderRadius: theme.borderRadius.full,
                              backgroundColor: theme.colors.surface,
                              borderWidth: 2,
                              borderColor: theme.colors.background,
                            },
                          ]}
                        />
                      ) : (
                        <View
                          style={[
                            styles.attendeeAvatar,
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
                          <Ionicons name="person" size={16} color={theme.colors.text.tertiary} />
                        </View>
                      )}
                    </View>
                  ))}
                  {attendeeCount > 10 && (
                    <View
                      style={[
                        styles.attendeeAvatar,
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
                          fontSize: theme.typography.sizes.xs,
                          fontWeight: theme.typography.weights.semibold,
                        }}
                      >
                        +{attendeeCount - 10}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          )}

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* RSVP Button */}
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
        {isGoing ? (
          <Button
            title="Cancel RSVP"
            variant="outline"
            onPress={() => rsvpMutation.mutate('declined')}
            loading={rsvpMutation.isPending}
            style={{ flex: 1 }}
            icon={<Ionicons name="checkmark-circle" size={20} color={theme.colors.text.primary} />}
          />
        ) : isWaitlist ? (
          <Button
            title="Leave Waitlist"
            variant="outline"
            onPress={() => rsvpMutation.mutate('declined')}
            loading={rsvpMutation.isPending}
            style={{ flex: 1 }}
            icon={<Ionicons name="time-outline" size={20} color={theme.colors.text.primary} />}
          />
        ) : (
          <Button
            title="RSVP to Event"
            variant="primary"
            onPress={() => rsvpMutation.mutate('going')}
            loading={rsvpMutation.isPending}
            style={{ flex: 1 }}
            icon={<Ionicons name="calendar" size={20} color="#FFFFFF" />}
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
  },
  attendeesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  attendeeAvatar: {
    width: 32,
    height: 32,
  },
  actionButtons: {
    flexDirection: 'row',
  },
});
