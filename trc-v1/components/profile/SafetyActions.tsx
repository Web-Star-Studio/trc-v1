// Safety Actions Component - Block and Report functionality
import React from 'react';
import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/context/AuthContext';
import { useSensory } from '@/lib/context/SensoryContext';
import { useRouter } from 'expo-router';

interface SafetyActionsProps {
  targetUserId: string;
  targetUserName: string;
}

export function useSafetyActions({ targetUserId, targetUserName }: SafetyActionsProps) {
  const { user } = useAuth();
  const { triggerHaptic } = useSensory();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Block user mutation
  const blockMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('blocks').insert({
        blocker_id: user!.id,
        blocked_id: targetUserId,
      });

      if (error) throw error;

      // Log to audit
      await supabase.from('audit_log').insert({
        actor_id: user!.id,
        action: 'user.blocked',
        subject_type: 'user',
        subject_id: targetUserId,
        meta: { target_name: targetUserName },
      });
    },
    onSuccess: () => {
      triggerHaptic('success');
      queryClient.invalidateQueries({ queryKey: ['discover-candidates'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      Alert.alert(
        'User Blocked',
        `${targetUserName} has been blocked. You won't see their profile or receive messages from them.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: (error: any) => {
      triggerHaptic('error');
      Alert.alert('Error', error.message || 'Failed to block user');
    },
  });

  // Report user mutation
  const reportMutation = useMutation({
    mutationFn: async ({
      reason,
      details,
      severity,
    }: {
      reason: string;
      details?: string;
      severity?: 'low' | 'medium' | 'high';
    }) => {
      const { error } = await supabase.rpc('report_subject', {
        p_subject_type: 'user',
        p_subject_id: targetUserId,
        p_reason: reason,
        p_details: details || null,
        p_severity: severity || 'medium',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      triggerHaptic('success');
      Alert.alert(
        'Report Submitted',
        'Thank you for your report. Our moderation team will review it shortly.'
      );
    },
    onError: (error: any) => {
      triggerHaptic('error');
      Alert.alert('Error', error.message || 'Failed to submit report');
    },
  });

  const showBlockConfirmation = () => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${targetUserName}? You won't see their profile or receive messages from them.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => blockMutation.mutate(),
        },
      ]
    );
  };

  const showReportDialog = () => {
    Alert.alert(
      'Report User',
      `Why are you reporting ${targetUserName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Harassment',
          onPress: () =>
            reportMutation.mutate({
              reason: 'harassment',
              severity: 'high',
            }),
        },
        {
          text: 'Inappropriate Content',
          onPress: () =>
            reportMutation.mutate({
              reason: 'inappropriate_content',
              severity: 'medium',
            }),
        },
        {
          text: 'Spam',
          onPress: () =>
            reportMutation.mutate({
              reason: 'spam',
              severity: 'low',
            }),
        },
        {
          text: 'Other',
          onPress: () =>
            Alert.prompt(
              'Report Details',
              'Please describe the issue:',
              (details) => {
                if (details) {
                  reportMutation.mutate({
                    reason: 'other',
                    details,
                    severity: 'medium',
                  });
                }
              }
            ),
        },
      ],
      { cancelable: true }
    );
  };

  return {
    showBlockConfirmation,
    showReportDialog,
    isBlocking: blockMutation.isPending,
    isReporting: reportMutation.isPending,
  };
}
