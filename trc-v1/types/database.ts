// Database types for The Ribbon Club
// Generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          pronouns: string | null;
          bio: string | null;
          photos: string[];
          interests: string[];
          boundaries: any;
          location_lat: number | null;
          location_lng: number | null;
          location_fuzzy_lat: number | null;
          location_fuzzy_lng: number | null;
          onboarding_completed: boolean;
          profile_completeness: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          pronouns?: string | null;
          bio?: string | null;
          photos?: string[];
          interests?: string[];
          boundaries?: any;
          location_lat?: number | null;
          location_lng?: number | null;
          location_fuzzy_lat?: number | null;
          location_fuzzy_lng?: number | null;
          onboarding_completed?: boolean;
          profile_completeness?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          pronouns?: string | null;
          bio?: string | null;
          photos?: string[];
          interests?: string[];
          boundaries?: any;
          location_lat?: number | null;
          location_lng?: number | null;
          location_fuzzy_lat?: number | null;
          location_fuzzy_lng?: number | null;
          onboarding_completed?: boolean;
          profile_completeness?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      sensory_profiles: {
        Row: {
          user_id: string;
          motion_ok: boolean;
          high_contrast: boolean;
          haptics_ok: boolean;
          content_filters: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          motion_ok?: boolean;
          high_contrast?: boolean;
          haptics_ok?: boolean;
          content_filters?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          motion_ok?: boolean;
          high_contrast?: boolean;
          haptics_ok?: boolean;
          content_filters?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          liker_id: string;
          liked_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          liker_id: string;
          liked_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          liker_id?: string;
          liked_id?: string;
          created_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          user_a: string;
          user_b: string;
          status: 'pending' | 'mutual' | 'blocked';
          score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_a: string;
          user_b: string;
          status?: 'pending' | 'mutual' | 'blocked';
          score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_a?: string;
          user_b?: string;
          status?: 'pending' | 'mutual' | 'blocked';
          score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          text: string | null;
          media_url: string | null;
          moderation_flags: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          text?: string | null;
          media_url?: string | null;
          moderation_flags?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          text?: string | null;
          media_url?: string | null;
          moderation_flags?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          tags: string[];
          rules: string | null;
          visibility: 'public' | 'private';
          owner_id: string;
          member_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          tags?: string[];
          rules?: string | null;
          visibility?: 'public' | 'private';
          owner_id: string;
          member_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          tags?: string[];
          rules?: string | null;
          visibility?: 'public' | 'private';
          owner_id?: string;
          member_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          group_id: string | null;
          host_id: string;
          title: string;
          description: string | null;
          starts_at: string;
          ends_at: string | null;
          venue_json: any;
          capacity: number | null;
          accessibility_notes: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id?: string | null;
          host_id: string;
          title: string;
          description?: string | null;
          starts_at: string;
          ends_at?: string | null;
          venue_json?: any;
          capacity?: number | null;
          accessibility_notes?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string | null;
          host_id?: string;
          title?: string;
          description?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          venue_json?: any;
          capacity?: number | null;
          accessibility_notes?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      rsvps: {
        Row: {
          user_id: string;
          event_id: string;
          status: 'going' | 'waitlist' | 'declined';
          checked_in_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          event_id: string;
          status?: 'going' | 'waitlist' | 'declined';
          checked_in_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          event_id?: string;
          status?: 'going' | 'waitlist' | 'declined';
          checked_in_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      blocks: {
        Row: {
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: {
          blocker_id?: string;
          blocked_id?: string;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          subject_type: 'user' | 'message' | 'event' | 'group';
          subject_id: string;
          reason: string;
          details: string | null;
          severity: 'low' | 'medium' | 'high';
          status: 'open' | 'reviewed' | 'resolved' | 'dismissed';
          moderator_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          subject_type: 'user' | 'message' | 'event' | 'group';
          subject_id: string;
          reason: string;
          details?: string | null;
          severity?: 'low' | 'medium' | 'high';
          status?: 'open' | 'reviewed' | 'resolved' | 'dismissed';
          moderator_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          subject_type?: 'user' | 'message' | 'event' | 'group';
          subject_id?: string;
          reason?: string;
          details?: string | null;
          severity?: 'low' | 'medium' | 'high';
          status?: 'open' | 'reviewed' | 'resolved' | 'dismissed';
          moderator_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      create_or_get_match: {
        Args: { target_user_id: string };
        Returns: {
          match_id: string;
          conversation_id: string;
          is_new: boolean;
        };
      };
      score_candidates: {
        Args: {
          max_distance_km?: number;
          interest_filters?: string[];
          limit_count?: number;
          offset_count?: number;
        };
        Returns: {
          user_id: string;
          display_name: string;
          pronouns: string | null;
          bio: string | null;
          photos: string[];
          interests: string[];
          match_score: number;
          distance_km: number | null;
        }[];
      };
      rsvp_event: {
        Args: {
          p_event_id: string;
          p_status?: 'going' | 'waitlist' | 'declined';
        };
        Returns: {
          rsvp_status: 'going' | 'waitlist' | 'declined';
          waitlist_position: number | null;
          message: string;
        };
      };
    };
  };
}
