# Quick Start Guide - The Ribbon Club

This guide will help you get The Ribbon Club running in under 10 minutes.

## Prerequisites

Make sure you have these installed:
- Node.js 18+ (`node --version`)
- npm (`npm --version`)
- Expo CLI (`npm install -g expo-cli`)
- Supabase CLI (`npm install -g supabase`)

## Step-by-Step Setup

### 1. Install Dependencies (2 minutes)

```bash
npm install
```

### 2. Start Supabase Locally (1 minute)

```bash
npm run supabase:start
```

This will output something like:
```
API URL: http://localhost:54321
anon key: eyJhbGc...
```

### 3. Configure Environment (1 minute)

Copy the `.env.example` file:

```bash
cp .env.example .env
```

Edit `.env` and paste your local Supabase credentials:

```bash
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-step-2
```

### 4. Apply Database Migrations (30 seconds)

```bash
npm run supabase:reset
```

This creates all the tables, RLS policies, and functions.

### 5. Start the App (30 seconds)

```bash
npm start
```

Then press `i` for iOS or `a` for Android.

## First Steps in the App

1. **Sign In**: Use the email magic link (check your terminal for the link in local mode)
2. **Create Profile**: Add your name, pronouns, and interests
3. **Set Sensory Preferences**: Configure motion, contrast, and haptics
4. **Explore**: Browse the discovery feed

## Common Issues

### "Supabase not found"
Run `npm install -g supabase` to install the CLI globally.

### "Cannot find Supabase URL"
Make sure your `.env` file is in the project root and contains the correct values.

### "Database connection failed"
Ensure Supabase is running with `npm run supabase:status`.

### "Expo command not found"
Install Expo CLI: `npm install -g expo-cli`

## Development Tips

### View Supabase Studio (Database UI)

Open http://localhost:54323 in your browser to:
- View tables and data
- Run SQL queries
- Test RLS policies
- View logs

### Hot Reload

Edit any file in `app/`, `components/`, or `lib/` and the app will automatically reload.

### View Logs

Check the Expo dev tools at http://localhost:8081 for:
- Console logs
- Network requests
- Performance metrics

### Test Different Sensory Modes

Toggle sensory settings in the app to see:
- Reduced motion (animations disabled)
- High contrast (increased color contrast)
- Haptics disabled (no vibration feedback)

## Next Steps

1. **Read the full README**: `README.md` for complete documentation
2. **Review the database schema**: `supabase/migrations/` for table structures
3. **Explore the code**: Start with `app/_layout.tsx` and `lib/context/`
4. **Run tests**: `npm test` to see example tests
5. **Check the requirements**: Review the full project requirements in the initial prompt

## Useful Commands

```bash
# Development
npm start              # Start Expo dev server
npm test              # Run unit tests
npm run type-check    # Run TypeScript type checking

# Supabase
npm run supabase:status    # Check Supabase status
npm run supabase:reset     # Reset database with fresh migrations
npm run supabase:stop      # Stop Supabase

# Building
eas build --profile preview --platform ios    # Build for testing
```

## Project Structure Overview

```
Key Files to Explore:
├── app/_layout.tsx               # Root layout with auth routing
├── app/(auth)/login.tsx          # Login screen
├── app/(tabs)/discover.tsx       # Discovery feed
├── lib/context/AuthContext.tsx   # Authentication state
├── lib/context/SensoryContext.tsx # Accessibility settings
├── lib/supabase.ts               # Supabase client
├── components/ui/Button.tsx      # Accessible button component
└── supabase/migrations/          # Database schema
```

## Getting Help

- Check the README for detailed documentation
- Review the TypeScript types in `types/`
- Look at example tests in `__tests__/`
- Inspect the database schema in Supabase Studio

Happy coding!
