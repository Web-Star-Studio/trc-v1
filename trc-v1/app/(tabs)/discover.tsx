// Discovery Feed Screen
import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/lib/context/ThemeContext';
import { useDiscovery } from '@/lib/hooks/useDiscovery';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { mockProfiles } from '@/lib/mock';

export default function DiscoverScreen() {
  const { theme } = useTheme();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useDiscovery();

  const realProfiles = data?.pages.flat() || [];

  // Combine real profiles with mock profiles for demo purposes
  const profiles = [...mockProfiles, ...realProfiles];

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error }}>Error loading profiles</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProfileCard profile={item} />}
        contentContainerStyle={{ padding: theme.spacing.md }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
              No profiles to show. Try adjusting your filters!
            </Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 20 }} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});
