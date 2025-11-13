// Groups Screen - Browse and join community groups
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/context/AuthContext';
import { mockGroups } from '@/lib/mock';

export default function GroupsScreen() {
  const { theme } = useTheme();
  const { triggerHaptic } = useSensory();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch groups
  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('visibility', 'public')
        .order('member_count', { ascending: false });

      if (error) throw error;

      // Combine real groups with mock groups for demo purposes
      const realGroups = data || [];
      return [...mockGroups, ...realGroups];
    },
  });

  // Check user's group memberships
  const { data: memberships } = useQuery({
    queryKey: ['group-memberships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user!.id);

      if (error) throw error;
      return data?.map((m) => m.group_id) || [];
    },
    enabled: !!user,
  });

  // Join group mutation
  const joinMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase.from('group_members').insert({
        group_id: groupId,
        user_id: user!.id,
        role: 'member',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      triggerHaptic('success');
      queryClient.invalidateQueries({ queryKey: ['group-memberships'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  // Leave group mutation
  const leaveMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      triggerHaptic('light');
      queryClient.invalidateQueries({ queryKey: ['group-memberships'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const renderGroup = ({ item }: { item: any }) => {
    const isMember = memberships?.includes(item.id);

    return (
      <Card
        variant="outlined"
        style={{ marginBottom: theme.spacing.md }}
        onPress={() => router.push(`/group/${item.id}`)}
      >
        <View style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <Text
              style={{
                color: theme.colors.text.primary,
                fontSize: theme.typography.sizes.lg,
                fontWeight: theme.typography.weights.bold,
              }}
            >
              {item.name}
            </Text>
            <Text
              style={{
                color: theme.colors.text.tertiary,
                fontSize: theme.typography.sizes.xs,
              }}
            >
              {item.member_count} members
            </Text>
          </View>

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

          {item.tags && item.tags.length > 0 && (
            <View style={[styles.tagsContainer, { marginTop: theme.spacing.sm }]}>
              {item.tags.slice(0, 3).map((tag: string, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderRadius: theme.borderRadius.sm,
                      paddingVertical: theme.spacing.xs,
                      paddingHorizontal: theme.spacing.sm,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: theme.colors.text.secondary,
                      fontSize: theme.typography.sizes.xs,
                    }}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Button
            title={isMember ? 'Leave Group' : 'Join Group'}
            variant={isMember ? 'outline' : 'primary'}
            size="sm"
            onPress={() => {
              if (isMember) {
                leaveMutation.mutate(item.id);
              } else {
                joinMutation.mutate(item.id);
              }
            }}
            loading={joinMutation.isPending || leaveMutation.isPending}
            style={{ marginTop: theme.spacing.md }}
          />
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
          Groups
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.colors.text.secondary }}>Loading groups...</Text>
        </View>
      ) : !groups || groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48, marginBottom: theme.spacing.md }}>👥</Text>
          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.sizes.xl,
              fontWeight: theme.typography.weights.bold,
              marginBottom: theme.spacing.sm,
            }}
          >
            No groups yet
          </Text>
          <Text
            style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.sizes.md,
              textAlign: 'center',
              paddingHorizontal: theme.spacing.xl,
            }}
          >
            Groups are coming soon! Check back later.
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroup}
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
  groupCard: {
    // Styles applied dynamically
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    // Styles applied dynamically
  },
});
