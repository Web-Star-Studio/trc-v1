# Enabling Sentry Error Tracking

Sentry is optional during development but recommended for production to track errors and crashes.

## When to Enable Sentry

- ✅ **Production builds** - Essential for monitoring real user issues
- ✅ **Beta testing** - Helpful for catching issues before full release
- ⚠️ **Development** - Optional, can add noise to your workflow

## Setup Steps

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io) and sign up
2. Create a new project and select "React Native"
3. Copy your DSN (Data Source Name)

### 2. Install Sentry Package

```bash
npm install @sentry/react-native
```

### 3. Add Sentry Plugin to app.json

Edit `app.json` and add the Sentry plugin to the plugins array:

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "expo-secure-store",
      // ... other plugins ...
      [
        "@sentry/react-native/expo",
        {
          "organization": "your-org-slug",
          "project": "trc-v1"
        }
      ]
    ]
  }
}
```

### 4. Configure Environment Variables

Edit your `.env` file and uncomment the Sentry variables:

```bash
# Sentry Error Tracking
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-auth-token
```

To get your auth token:
1. Go to Sentry → Settings → Account → Auth Tokens
2. Create a new token with `project:releases` scope

### 5. Initialize Sentry in Your App

Create `lib/sentry.ts`:

```typescript
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

export function initSentry() {
  const dsn = Constants.expoConfig?.extra?.SENTRY_DSN || process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_APP_ENV || 'development',
    enableInExpoDevelopment: false, // Disable in dev mode
    debug: false,
    tracesSampleRate: 1.0, // Adjust based on your needs
    beforeSend(event) {
      // Filter out events in development
      if (__DEV__) {
        return null;
      }
      return event;
    },
  });
}
```

Then in `app/_layout.tsx`, initialize Sentry at the top:

```typescript
import { initSentry } from '@/lib/sentry';

// Initialize Sentry before anything else
initSentry();

export default function RootLayout() {
  // ... rest of your code
}
```

### 6. Wrap Root Component (Optional)

For better error boundaries, wrap your root component:

```typescript
import * as Sentry from '@sentry/react-native';

function RootLayout() {
  // your layout code
}

export default Sentry.wrap(RootLayout);
```

### 7. Test Sentry Integration

Add a test error button somewhere:

```typescript
import * as Sentry from '@sentry/react-native';

<Button
  title="Test Sentry"
  onPress={() => {
    Sentry.captureMessage('Test error from TRC app');
  }}
/>
```

### 8. Rebuild Your App

After adding Sentry, you need to rebuild:

```bash
# For development
npx expo prebuild

# For production
eas build --platform all
```

## Usage

### Capturing Errors

```typescript
import * as Sentry from '@sentry/react-native';

try {
  // risky operation
} catch (error) {
  Sentry.captureException(error);
}
```

### Capturing Messages

```typescript
Sentry.captureMessage('Something important happened');
```

### Adding Context

```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
});

Sentry.setTag('feature', 'discovery');
Sentry.setContext('profile', { completeness: 75 });
```

### Breadcrumbs

Breadcrumbs are automatically captured for:
- Navigation events
- Network requests
- Console logs

## Best Practices

1. **Filter PII**: Don't send sensitive user data
   ```typescript
   beforeSend(event) {
     // Remove email from user data
     if (event.user?.email) {
       event.user.email = '***@***.com';
     }
     return event;
   }
   ```

2. **Sample Rates**: Don't send 100% of events in production
   ```typescript
   tracesSampleRate: 0.1, // 10% of transactions
   ```

3. **Release Tracking**: Add releases for better tracking
   ```json
   {
     "hooks": {
       "postPublish": [
         {
           "file": "sentry-expo/upload-sourcemaps",
           "config": {
             "organization": "your-org",
             "project": "trc-v1"
           }
         }
       ]
     }
   }
   ```

4. **Ignore Common Errors**: Filter out network timeouts, etc.
   ```typescript
   ignoreErrors: [
     'Network request failed',
     'timeout',
   ]
   ```

## Cost Management

Sentry has a free tier but costs can add up:

- **Free tier**: 5,000 events/month
- **Paid**: Starts at $26/month

Tips to stay under limits:
- Use sampling (`tracesSampleRate: 0.1`)
- Filter out noisy errors
- Disable in development
- Set up proper error boundaries

## Troubleshooting

### Sentry not receiving events

1. Check DSN is correct
2. Verify `enableInExpoDevelopment` is false
3. Check network connectivity
4. Look for errors in Metro bundler

### Too many events

1. Reduce `tracesSampleRate`
2. Add more `ignoreErrors` patterns
3. Implement rate limiting

### Source maps not uploading

1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check auth token has correct permissions
3. Run `npx sentry-cli login` to test

## Removing Sentry

If you want to remove Sentry later:

```bash
# Uninstall
npm uninstall @sentry/react-native

# Remove from app.json plugins
# Remove Sentry initialization from app/_layout.tsx
# Comment out env variables
```

## Resources

- [Sentry React Native Docs](https://docs.sentry.io/platforms/react-native/)
- [Expo + Sentry Guide](https://docs.expo.dev/guides/using-sentry/)
- [Sentry Best Practices](https://docs.sentry.io/platforms/react-native/best-practices/)
