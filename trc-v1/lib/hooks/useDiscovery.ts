// React Query Hooks for Discovery Feed
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CandidateProfile } from '@/types';

interface DiscoveryFilters {
  maxDistanceKm?: number;
  interests?: string[];
}

export function useDiscovery(filters: DiscoveryFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['discovery', filters],
    queryFn: async ({ pageParam = 0 }) => {
      // @ts-expect-error - RPC types will be available after database setup
      const { data, error } = await supabase.rpc('score_candidates', {
        max_distance_km: filters.maxDistanceKm || 50,
        interest_filters: filters.interests || null,
        limit_count: 20,
        offset_count: pageParam,
      });

      if (error) throw error;
      return data as CandidateProfile[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined;
      return allPages.length * 20;
    },
    initialPageParam: 0,
  });
}

export function useLikeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (likedUserId: string) => {
      // @ts-expect-error - Table types will be available after database setup
      const { data, error } = await supabase
        .from('likes')
        .insert([{ liked_id: likedUserId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discovery'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      // @ts-expect-error - RPC types will be available after database setup
      const { data, error } = await supabase.rpc('create_or_get_match', {
        target_user_id: targetUserId,
      });

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
