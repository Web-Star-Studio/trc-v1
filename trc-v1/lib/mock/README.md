# Mock Data Documentation

This directory contains mock data for development and testing purposes. Mock data allows the app to function with realistic content even when the backend is unavailable or during development.

## Overview

The mock data system provides:
- **Realistic profiles** of neurodivergent individuals
- **Upcoming events** with full details and attendees
- **Community groups** with members and activities
- **Helper functions** for easy data access
- **Automatic fallback** when real data isn't available

## Data Files

### `profiles.ts`
Contains 6 diverse mock profiles with:
- Display names and pronouns
- Bios and photos (from Unsplash)
- Interests and hobbies
- Neurodivergence types
- Accessibility needs
- Relationship preferences
- Match scores and distances

### `events.ts`
Contains 6 mock events including:
- Coffee meetups
- Crafting circles
- Nature walks
- Board game nights
- Writing workshops
- Movie nights

Each event includes:
- Full descriptions
- Date/time information
- Venue details with accessibility info
- Host information
- Associated group
- Attendee lists
- Capacity limits

### `groups.ts`
Contains 8 mock groups such as:
- Neurodivergent Coffee Lovers
- ADHD Creative Collective
- Outdoor Friends
- ND Gamers Unite
- Writers Circle
- And more!

Each group includes:
- Name and description
- Member count
- Tags/interests
- Visibility settings
- Member list with roles
- Upcoming events

## Usage

### Importing Mock Data

```typescript
// Import specific data sets
import { mockProfiles, mockEvents, mockGroups } from '@/lib/mock';

// Import helper functions
import { 
  getMockProfileById, 
  getMockEventById, 
  getMockGroupById 
} from '@/lib/mock';

// Import all at once
import { mockData, mockHelpers } from '@/lib/mock';
```

### Using Helper Functions

```typescript
// Get a specific profile by ID
const profile = getMockProfileById('mock-profile-1');

// Get a random profile
const randomProfile = getRandomMockProfile();

// Get multiple profiles
const profiles = getMockProfiles(5); // Returns 5 profiles

// Get a specific event
const event = getMockEventById('mock-event-1');

// Get upcoming events (sorted by date)
const upcomingEvents = getUpcomingMockEvents();

// Get a specific group
const group = getMockGroupById('mock-group-1');

// Get public groups only
const publicGroups = getMockGroupsByVisibility('public');
```

### In Components

Mock data is automatically used in the following scenarios:

1. **When ID starts with 'mock-'**
   - Profile, event, and group detail screens check for 'mock-' prefix
   - Automatically returns mock data without hitting Supabase

2. **As fallback on errors**
   - If Supabase query fails, mock data is used as fallback
   - Ensures app never shows empty/broken state during development

3. **In main feed screens**
   - Mock data is prepended to real data in discover, events, and groups screens
   - Provides immediate content for testing and demos

## Mock Data IDs

All mock data uses predictable IDs:

### Profiles
- `mock-profile-1` - Alex Rivera (Autistic artist, they/them)
- `mock-profile-2` - Jordan Lee (ADHD game developer, he/him)
- `mock-profile-3` - Sam Chen (Dyslexic writer, she/her)
- `mock-profile-4` - Taylor Morgan (Musician with synesthesia, they/she)
- `mock-profile-5` - Riley Park (Autistic software engineer, he/they)
- `mock-profile-6` - Casey Williams (Artist and activist, she/they)

### Events
- `mock-event-1` - Quiet Coffee Meetup
- `mock-event-2` - ADHD Crafting Circle
- `mock-event-3` - Nature Walk & Photography
- `mock-event-4` - Board Game Night - Low Sensory
- `mock-event-5` - Poetry & Writing Workshop
- `mock-event-6` - Movie Night: Cozy Edition

### Groups
- `mock-group-1` - Neurodivergent Coffee Lovers
- `mock-group-2` - ADHD Creative Collective
- `mock-group-3` - Outdoor Friends
- `mock-group-4` - ND Gamers Unite
- `mock-group-5` - Neurodivergent Writers Circle
- `mock-group-6` - Autistic Adults Social Club
- `mock-group-7` - Mental Health & Wellness
- `mock-group-8` - Music & Sound Explorers

## Testing Navigation

To test detail screens with mock data:

```typescript
// Navigate to mock profile
router.push('/profile/mock-profile-1');

// Navigate to mock event
router.push('/event/mock-event-1');

// Navigate to mock group
router.push('/group/mock-group-1');
```

## Data Relationships

Mock data includes proper relationships:

- **Events reference:**
  - Host profiles (with photos)
  - Groups they belong to
  - Attendee lists

- **Groups reference:**
  - Member profiles (with roles: admin, moderator, member)
  - Upcoming events
  - Member counts

- **Profiles include:**
  - Multiple photos
  - Rich metadata
  - Accessibility information

## Images

All mock profile and event images use Unsplash URLs:
- High-quality, free-to-use images
- Properly sized (400x400 for avatars, 800x1000 for profiles)
- CDN-hosted for fast loading
- Consistent aesthetic

**Note:** These are placeholder images. In production, users would upload their own photos.

## Customizing Mock Data

To add more mock data:

1. Add new objects to the arrays in `profiles.ts`, `events.ts`, or `groups.ts`
2. Follow the existing structure
3. Use IDs starting with `mock-`
4. Ensure relationships are consistent

Example:

```typescript
{
  id: 'mock-profile-7',
  displayName: 'Your Name',
  pronouns: 'they/them',
  bio: 'Your bio here...',
  photos: ['https://images.unsplash.com/...'],
  interests: ['Interest 1', 'Interest 2'],
  matchScore: 85,
  distanceKm: 10,
  // ... other fields
}
```

## Feature Flag

The `USE_MOCK_DATA` flag in `index.ts` can be used to toggle mock data:

```typescript
// Set via environment variable
USE_MOCK_DATA=true npm start

// Or check in code
if (USE_MOCK_DATA) {
  // Use mock data exclusively
}
```

Currently defaults to `true` in development mode (`__DEV__`).

## Benefits

1. **Offline Development**: Work without backend connectivity
2. **Consistent Testing**: Same data across environments
3. **Demo-Ready**: Always have content to show
4. **Fast Iteration**: No need to seed database
5. **Realistic Content**: Neurodivergent-focused, inclusive data
6. **Accessibility Examples**: Shows proper accessibility information

## Notes

- Mock data is meant for development only
- Don't rely on mock data IDs in production code
- Mock data is mixed with real data in feed screens
- All mock data includes proper accessibility information
- Match scores and distances are randomized for realism
- Event dates are calculated relative to current time
- Mock RSVP/join actions don't persist (safe to test)

## Updating Mock Data

When updating mock data:

1. Keep data realistic and representative
2. Maintain neurodivergent-affirming language
3. Include diverse representation
4. Ensure accessibility information is present
5. Test navigation and relationships
6. Update this README if structure changes

## Questions?

If you need different mock data or have questions about the structure, check:
- Type definitions in `types/index.ts`
- Usage in detail screens (`app/profile/[id].tsx`, etc.)
- Helper functions in this directory