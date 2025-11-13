// App Constants

export const INTERESTS = [
  'hiking',
  'board-games',
  'art',
  'music',
  'tech',
  'cooking',
  'photography',
  'reading',
  'gaming',
  'yoga',
  'coffee',
  'sci-fi',
  'gardening',
  'crafts',
  'cycling',
  'theater',
  'volunteering',
  'writing',
  'meditation',
  'dance',
  'film',
  'podcasts',
  'fashion',
  'travel',
  'pets',
  'fitness',
  'music-production',
  'diy',
  'activism',
  'comics',
] as const;

export const PRONOUNS = [
  'he/him',
  'she/her',
  'they/them',
  'he/they',
  'she/they',
  'any pronouns',
  'ask me',
] as const;

export const REPORT_REASONS = [
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'safety_concern', label: 'Safety concern' },
  { value: 'other', label: 'Other' },
] as const;

export const MAX_PHOTOS = 6;
export const MIN_PHOTOS = 1;
export const MAX_BIO_LENGTH = 500;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_INTERESTS = 10;

export const DISTANCE_BUCKETS = [
  { value: 10, label: 'Within 10 km' },
  { value: 25, label: 'Within 25 km' },
  { value: 50, label: 'Within 50 km' },
  { value: 100, label: 'Within 100 km' },
  { value: 999, label: 'Any distance' },
] as const;

export const CONTENT_FILTERS = [
  { key: 'flashingLights', label: 'Flashing lights' },
  { key: 'loudSounds', label: 'Loud sounds' },
  { key: 'crowdedSpaces', label: 'Crowded spaces' },
  { key: 'strongScents', label: 'Strong scents' },
] as const;

// Onboarding steps
export const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Learn about The Ribbon Club',
  },
  {
    id: 'sensory',
    title: 'Sensory Preferences',
    description: 'Set your comfort preferences',
  },
  {
    id: 'profile',
    title: 'Create Profile',
    description: 'Tell us about yourself',
  },
  {
    id: 'interests',
    title: 'Select Interests',
    description: 'What do you enjoy?',
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Find people nearby',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Stay connected',
  },
] as const;

// App metadata
export const APP_NAME = 'The Ribbon Club';
export const APP_VERSION = '1.0.0';
export const SUPPORT_EMAIL = 'support@ribbonclub.app';
export const PRIVACY_URL = 'https://ribbonclub.app/privacy';
export const TERMS_URL = 'https://ribbonclub.app/terms';
