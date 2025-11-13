// Supabase Edge Function: Send Push Notification
// Handles FCM (Android) and APNs (iOS) push notifications

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  category?: 'match' | 'message' | 'event' | 'rsvp';
}

serve(async (req) => {
  try {
    const { userId, title, body, data, category }: PushPayload = await req.json();

    // Validate input
    if (!userId || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, title, body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's notification tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('notification_tokens')
      .select('token, platform')
      .eq('user_id', userId);

    if (tokensError || !tokens || tokens.length === 0) {
      console.warn(`No notification tokens found for user ${userId}`);
      return new Response(
        JSON.stringify({ message: 'No tokens found', sent: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check notification preferences
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Respect category-specific preferences
    if (prefs) {
      if (category === 'match' && !prefs.matches) return successResponse(0);
      if (category === 'message' && !prefs.messages) return successResponse(0);
      if (category === 'event' && !prefs.events) return successResponse(0);
      if (category === 'rsvp' && !prefs.rsvp_updates) return successResponse(0);

      // Check quiet hours (if applicable)
      if (prefs.quiet_hours_start && prefs.quiet_hours_end) {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
        if (
          currentTime >= prefs.quiet_hours_start &&
          currentTime <= prefs.quiet_hours_end
        ) {
          console.log(`Skipping push during quiet hours for user ${userId}`);
          return successResponse(0);
        }
      }
    }

    // Build Expo push messages
    const messages = tokens.map((token) => ({
      to: token.token,
      sound: 'default',
      title,
      body,
      data: data || {},
      categoryId: category,
      priority: 'high',
    }));

    // Send to Expo Push Service
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      throw new Error(`Expo Push API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Push sent:', result);

    return new Response(
      JSON.stringify({ success: true, sent: messages.length, result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function successResponse(count: number) {
  return new Response(
    JSON.stringify({ message: 'Notification skipped due to preferences', sent: count }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
