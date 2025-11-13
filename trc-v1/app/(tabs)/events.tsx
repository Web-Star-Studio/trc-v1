// Events Screen - Browse and RSVP to events
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/context/AuthContext';
import { mockEvents } from '@/lib/mock';

export default function EventsScreen() {
  const { theme } = useTheme();
  const { triggerHaptic } = useSensory();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch upcoming events
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('events')
        .select(
          `
          *,
          host:profiles!events_host_id_fkey(display_name),
          group:groups(name)
        `
        )
        .gte('starts_at', now)
        .order('starts_at', { ascending: true })
        .limit(20);

      if (error) throw error;

      // Combine real events with mock events for demo purposes
      const realEvents = data || [];
      return [...mockEvents, ...realEvents];
    },
  });

  // Check user's RSVPs
  const { data: rsvps } = useQuery({
    queryKey: ['my-rsvps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rsvps')
        .select('event_id, status')
        .eq('user_id', user!.id);

      if (error) throw error;

      const rsvpMap: Record<string, string> = {};
      data?.forEach((rsvp) => {
        rsvpMap[rsvp.event_id] = rsvp.status;
      });
      return rsvpMap;
    },
    enabled: !!user,
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'going' | 'declined' }) => {
      const { data, error } = await supabase.rpc('rsvp_event', {
        p_event_id: eventId,
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
      queryClient.invalidateQueries({ queryKey: ['my-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
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

  const renderEvent = ({ item }: { item: any }) => {
    const userRsvp = rsvps?.[item.id];
    const isGoing = userRsvp === 'going';
    const isWaitlist = userRsvp === 'waitlist';

    return (
      <Card
        variant="outlined"
        style={{ marginBottom: theme.spacing.md }}
        onPress={() => router.push(`/event/${item.id}`)}
      >
        <View style={styles.eventCard}>
          <View style={styles.eventHeader}>
            <Text
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.sizes.lg,
                fontWeight: theme.typography.weights.bold,
              }}
            >
              {item.title}
            </Text>
          </View>

          <Text
            style={{
              color: theme.colors.primary,
              fontSize: theme.typography.sizes.sm,
              marginTop: theme.spacing.xs,
              fontWeight: theme.typography.weights.medium,
            }}
          >
            📅 {formatDate(item.starts_at)}
          </Text>

          {item.host && (
            <Text
              style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.sizes.sm,
                marginTop: theme.spacing.xs,
              }}
            >
              Hosted by {item.host.display_name}
            </Text>
          )}

          {item.group && (
            <Text
              style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.sizes.sm,
              }}
            >
              In {item.group.name}
            </Text>
          )}

          {item.description && (
            <Text
              numberOfLines={3}
              style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.sizes.sm,
                marginTop: theme.spacing.sm,
                lineHeight: theme.typography.lineHeights.normal * theme.typography.sizes.sm,
              }}
            >
              {item.description}
            </Text>
          )}

          {item.venue_json?.name && (
            <Text
              style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.sizes.sm,
                marginTop: theme.spacing.sm,
              }}
            >
              📍 {item.venue_json.name}
            </Text>
          )}

          {item.accessibility_notes && (
            <Text
              style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.sizes.xs,
                marginTop: theme.spacing.sm,
                fontStyle: 'italic',
              }}
            >
              ♿ {item.accessibility_notes}
            </Text>
          )}

          {item.capacity && (
            <Text
              style={{
                color: theme.colors.text.tertiary,
                fontSize: theme.typography.sizes.xs,
                marginTop: theme.spacing.xs,
              }}
            >
              Capacity: {item.capacity} people
            </Text>
          )}

          <View style={[styles.rsvpButtons, { marginTop: theme.spacing.md }]}>
            {isGoing ? (
              <Button
                title="Going ✓"
                variant="primary"
                size="sm"
                onPress={() => rsvpMutation.mutate({ eventId: item.id, status: 'declined' })}
                loading={rsvpMutation.isPending}
                style={{ flex: 1 }}
              />
            ) : isWaitlist ? (
              <Button
                title="On Waitlist"
                variant="outline"
                size="sm"
                onPress={() => rsvpMutation.mutate({ eventId: item.id, status: 'declined' })}
                loading={rsvpMutation.isPending}
                style={{ flex: 1 }}
              />
            ) : (
              <Button
                title="RSVP"
                variant="outline"
                size="sm"
                onPress={() => rsvpMutation.mutate({ eventId: item.id, status: 'going' })}
                loading={rsvpMutation.isPending}
                style={{ flex: 1 }}
              />
            )}
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
          Events
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.colors.text.secondary }}>Loading events...</Text>
        </View>
      ) : !events || events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48, marginBottom: theme.spacing.md }}>📅</Text>
          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.sizes.xl,
              fontWeight: theme.typography.weights.bold,
              marginBottom: theme.spacing.sm,
            }}
          >
            No upcoming events
          </Text>
          <Text
            style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.sizes.md,
              textAlign: 'center',
              paddingHorizontal: theme.spacing.xl,
            }}
          >
            Events will appear here once they're created. Check back soon!
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
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
  eventCard: {
    // Styles applied dynamically
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rsvpButtons: {
    flexDirection: 'row',
    gap: 8,
  },
});
