# The Ribbon Club - MVP Bootstrap

An inclusive social app for neurodivergent-friendly connections, built with Expo, React Native, and Supabase.

## Features

- **Accessible-First Design**: High contrast themes, reduced motion support, haptic feedback controls
- **Profile & Matching**: Interest-based matching with privacy-preserving location fuzzing
- **1:1 Chat**: Real-time messaging with read receipts and typing indicators
- **Groups & Events**: Community-driven events with RSVP capacity management
- **Safety & Moderation**: Block/report functionality with audit logging
- **Push Notifications**: Category-specific notifications with quiet hours

## Tech Stack

- **Frontend**: React Native (Expo SDK 54), Expo Router
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: React Query (TanStack Query), Zustand
- **Styling**: Custom theme system with accessibility support
- **Testing**: Jest, React Native Testing Library, Detox (E2E)

## Project Structure

```
trc-v1/
├── app/                       # Expo Router screens
│   ├── (auth)/               # Authentication flow
│   ├── (tabs)/               # Main app tabs
│   └── _layout.tsx           # Root layout with providers
├── components/               # Reusable components
│   ├── ui/                   # Base UI (Button, Input, Card)
│   └── profile/              # Profile-specific components
├── lib/                      # Core logic
│   ├── context/              # React Context providers
│   ├── hooks/                # React Query hooks
│   ├── utils/                # Utility functions
│   ├── supabase.ts           # Supabase client
│   └── queryClient.ts        # React Query config
├── supabase/                 # Supabase configuration
│   ├── migrations/           # Database migrations
│   ├── functions/            # Edge Functions
│   └── config.toml           # Supabase config
├── types/                    # TypeScript types
└── constants/                # App constants
```

## Setup Instructions

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase CLI (`npm install -g supabase`)
- iOS Simulator (Mac) or Android Emulator

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

#### Option A: Local Development

```bash
# Start Supabase locally
npm run supabase:start

# This will output your local Supabase URL and anon key
# Copy these values to your .env file
```

#### Option B: Supabase Cloud

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Settings > API

### 3. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your Supabase credentials
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Database Migrations

```bash
# For local Supabase
npm run supabase:reset

# For Supabase Cloud
supabase db push
```

### 5. Start the Development Server

```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web

## Development Workflow

### Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# E2E tests (requires build)
npm run test:e2e:build
npm run test:e2e
```

### Database Management

```bash
# Create a new migration
supabase migration new migration_name

# Apply migrations
npm run supabase:reset

# View database status
npm run supabase:status
```

### Building for Production

```bash
# Preview build
eas build --profile preview --platform ios

# Production build
eas build --profile production --platform all
```

## Optional Features

### Error Tracking (Sentry)

Sentry is **optional during development** but recommended for production. To enable:

```bash
npm install @sentry/react-native
```

Then follow the guide: `docs/ENABLING_SENTRY.md`

**Why it's optional:**
- Adds noise during development
- Requires additional setup
- Not needed for MVP testing

**When to enable:**
- Beta testing
- Production deployment
- Team collaboration

### OAuth Providers

Apple and Google sign-in are configured but commented out in `.env`. To enable:

1. Set up OAuth apps in Apple/Google Developer Console
2. Add client IDs to `.env`
3. Uncomment the OAuth code in `lib/context/AuthContext.tsx`

### Analytics

Analytics (Amplitude, Segment, etc.) are stubbed out in `lib/utils/analytics.ts`. To enable:

1. Choose your analytics provider
2. Install the SDK
3. Update `analytics.ts` with real implementation

## Key Concepts

### Accessibility & Sensory Profiles

Every user has a sensory profile controlling:
- Motion/animations (reduced motion)
- High contrast theme
- Haptic feedback
- Content filters (flashing lights, loud sounds)

Access via `useSensory()` hook:

```tsx
const { settings, updateSettings, triggerHaptic } = useSensory();
```

### Privacy-Preserving Location

Exact locations are never shared. The system:
1. Stores exact coordinates privately
2. Fuzzes coordinates to ~2-3km radius for display
3. Uses fuzzy coordinates for distance calculations

### Row Level Security (RLS)

All database access is protected by RLS policies:
- Users can only view/edit their own data
- Blocked users are invisible in all queries
- Moderators have special access to reports

## Architecture Decisions

### Why Expo Router?

- Type-safe navigation with auto-generated routes
- Deep linking out of the box
- Shared layouts and nested routing

### Why React Query?

- Optimistic updates for instant UI feedback
- Automatic caching and background refetching
- Built-in loading/error states

### Why Supabase?

- Real-time subscriptions for chat
- Row Level Security for data protection
- Storage with pre-signed URLs
- Edge Functions for server logic

## MVP Scope

**In Scope:**
- Email magic link + OAuth auth
- Profile creation with sensory settings
- Discovery feed with filtering
- Like/match system
- 1:1 chat
- Groups & events with RSVP
- Block/report functionality
- Push notifications

**Out of Scope (Post-MVP):**
- Video/voice chat
- Payments & ticketing
- Group chat
- Advanced ML recommendations
- In-app verification badges

## Contributing

1. Create a feature branch from `main`
2. Make your changes with tests
3. Run `npm run type-check` and `npm test`
4. Submit a PR with a clear description

## License

Proprietary - All Rights Reserved

## Support

For issues or questions, please contact the development team.
