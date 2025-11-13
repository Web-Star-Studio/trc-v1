// Analytics stub - to be implemented with Amplitude/Segment/etc
// For MVP, this just logs events to console

interface AnalyticsEvent {
  [key: string]: any;
}

class Analytics {
  track(eventName: string, properties?: AnalyticsEvent) {
    if (__DEV__) {
      console.log('[Analytics]', eventName, properties);
    }
    // TODO: Implement actual analytics provider
    // Example: Amplitude.track(eventName, properties);
  }

  identify(userId: string, traits?: AnalyticsEvent) {
    if (__DEV__) {
      console.log('[Analytics] Identify', userId, traits);
    }
    // TODO: Implement actual analytics provider
    // Example: Amplitude.identify(userId, traits);
  }

  reset() {
    if (__DEV__) {
      console.log('[Analytics] Reset');
    }
    // TODO: Implement actual analytics provider
    // Example: Amplitude.reset();
  }
}

export const analytics = new Analytics();
