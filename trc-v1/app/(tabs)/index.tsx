// Discover Screen - Tinder-style swipe matching
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, Animated, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';
import { SwipeCard } from '@/components/ui/SwipeCard';
import { mockProfiles } from '@/lib/utils/mockProfiles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/context/AuthContext';

export default function DiscoverScreen() {
  const { theme } = useTheme();
  const { triggerHaptic } = useSensory();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const swiperRef = useRef<any>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState<'like' | 'nope' | null>(null);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (likedUserId: string) => {
      if (!user) return;

      const { error } = await supabase.from('likes').insert({
        liker_id: user.id,
        liked_id: likedUserId,
      });

      if (error) {
        // Ignore unique constraint violations (already liked)
        if (!error.message.includes('duplicate')) {
          throw error;
        }
      }

      // Check if it's a match
      try {
        const { data: matchData, error: matchError } = await supabase.rpc('create_or_get_match', {
          target_user_id: likedUserId,
        });

        if (matchData?.is_new) {
          return { isMatch: true, matchData };
        }
      } catch (e) {
        // Not a match yet, that's okay
      }

      return { isMatch: false };
    },
    onSuccess: (data) => {
      if (data?.isMatch) {
        triggerHaptic('success');
        Alert.alert("It's a Match! 💜", 'You can now start chatting!');
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      }
    },
  });

  const handleSwipedLeft = (cardIndex: number) => {
    const profile = mockProfiles[cardIndex];
    triggerHaptic('light');
    setShowOverlay('nope');
    setTimeout(() => setShowOverlay(null), 300);
    console.log('Passed:', profile.display_name);
  };

  const handleSwipedRight = (cardIndex: number) => {
    const profile = mockProfiles[cardIndex];
    triggerHaptic('medium');
    setShowOverlay('like');
    setTimeout(() => setShowOverlay(null), 300);

    // Like the profile
    if (user) {
      likeMutation.mutate(profile.user_id);
    }
    console.log('Liked:', profile.display_name);
  };

  const handleSwipedAll = () => {
    Alert.alert(
      'No More Profiles',
      "You've seen all available profiles. Check back later for new matches!",
      [{ text: 'OK' }]
    );
  };

  const onSwiped = (index: number) => {
    setCardIndex(index + 1);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.text.primary,
              fontSize: theme.typography.sizes['2xl'],
              fontWeight: theme.typography.weights.bold,
            },
          ]}
        >
          Discover
        </Text>
        <Text
          style={{
            color: theme.colors.text.tertiary,
            fontSize: theme.typography.sizes.sm,
          }}
        >
          {cardIndex} / {mockProfiles.length}
        </Text>
      </View>

      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={mockProfiles}
          renderCard={(card) => (card ? <SwipeCard profile={card} /> : <View />)}
          onSwipedLeft={handleSwipedLeft}
          onSwipedRight={handleSwipedRight}
          onSwipedAll={handleSwipedAll}
          onSwiped={onSwiped}
          cardIndex={0}
          backgroundColor="transparent"
          stackSize={3}
          stackScale={10}
          stackSeparation={15}
          disableTopSwipe
          disableBottomSwipe
          overlayLabels={{
            left: {
              title: 'NOPE',
              style: {
                label: {
                  backgroundColor: theme.colors.text.primary,
                  color: theme.colors.background,
                  fontSize: 24,
                  fontWeight: 'bold',
                  padding: 10,
                  borderRadius: 8,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30,
                },
              },
            },
            right: {
              title: 'LIKE',
              style: {
                label: {
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.onPrimary,
                  fontSize: 24,
                  fontWeight: 'bold',
                  padding: 10,
                  borderRadius: 8,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30,
                },
              },
            },
          }}
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeBackCard
        />
      </View>

      {/* Action buttons */}
      <View style={[styles.actionsContainer, { paddingBottom: theme.spacing.xl }]}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.colors.surface,
              borderWidth: 2,
              borderColor: theme.colors.border,
              borderRadius: theme.borderRadius.full,
              ...theme.shadows.md,
            },
          ]}
          onPress={() => {
            triggerHaptic('light');
            swiperRef.current?.swipeLeft();
          }}
          accessibilityRole="button"
          accessibilityLabel="Pass"
        >
          <Text style={{ fontSize: 32 }}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.undoButton,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: theme.borderRadius.full,
              ...theme.shadows.md,
            },
          ]}
          onPress={() => {
            triggerHaptic('light');
            swiperRef.current?.swipeBack();
          }}
          accessibilityRole="button"
          accessibilityLabel="Undo"
        >
          <Text style={{ fontSize: 24 }}>↶</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.likeButton,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.borderRadius.full,
              ...theme.shadows.lg,
            },
          ]}
          onPress={() => {
            triggerHaptic('medium');
            swiperRef.current?.swipeRight();
          }}
          accessibilityRole="button"
          accessibilityLabel="Like"
        >
          <Text style={{ fontSize: 32 }}>💜</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    // Styles applied dynamically
  },
  swiperContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  actionButton: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  undoButton: {
    width: 56,
    height: 56,
  },
  likeButton: {
    width: 72,
    height: 72,
  },
});
