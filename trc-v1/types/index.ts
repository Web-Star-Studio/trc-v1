// App-specific types

export * from './database';

// Sensory & Accessibility
export interface SensorySettings {
  motionOk: boolean;
  highContrast: boolean;
  hapticsOk: boolean;
  contentFilters: {
    flashingLights?: boolean;
    loudSounds?: boolean;
    crowdedSpaces?: boolean;
  };
}

// Onboarding
export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
  isComplete: boolean;
}

// Discovery & Matching
export interface CandidateProfile {
  id: string;
  displayName: string;
  pronouns?: string;
  bio?: string;
  photos: string[];
  interests: string[];
  matchScore: number;
  distanceKm?: number;
}

// Chat
export interface Conversation {
  id: string;
  participants: {
    id: string;
    displayName: string;
    photos: string[];
  }[];
  lastMessage?: {
    text: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

// Events
export interface Venue {
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  accessibility?: string;
}

// Navigation
export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  chat: { conversationId: string };
  profile: { userId: string };
  'event-details': { eventId: string };
  'group-details': { groupId: string };
  settings: undefined;
  'edit-profile': undefined;
};

// Analytics
export type AnalyticsEvent =
  | 'app_open'
  | 'user_signup'
  | 'onboarding_complete'
  | 'profile_complete'
  | 'like'
  | 'match_created'
  | 'message_send'
  | 'group_view'
  | 'event_view'
  | 'event_rsvp'
  | 'report_submit'
  | 'block_user'
  | 'sensory_toggle'
  | 'notification_opt_in';

export interface AnalyticsEventProps {
  event: AnalyticsEvent;
  properties?: Record<string, any>;
}

// Error handling
export interface AppError {
  code: string;
  message: string;
  details?: any;
}
