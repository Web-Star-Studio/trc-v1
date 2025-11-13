// Mock data index - exports all mock data for development and testing
export * from './profiles';
export * from './events';
export * from './groups';

// Re-export for convenience
import { mockProfiles, getMockProfileById, getRandomMockProfile, getMockProfiles } from './profiles';
import { mockEvents, getMockEventById, getRandomMockEvent, getMockEvents, getUpcomingMockEvents } from './events';
import { mockGroups, getMockGroupById, getRandomMockGroup, getMockGroups, getMockGroupsByVisibility } from './groups';

export const mockData = {
  profiles: mockProfiles,
  events: mockEvents,
  groups: mockGroups,
};

export const mockHelpers = {
  profiles: {
    getById: getMockProfileById,
    getRandom: getRandomMockProfile,
    getMultiple: getMockProfiles,
  },
  events: {
    getById: getMockEventById,
    getRandom: getRandomMockEvent,
    getMultiple: getMockEvents,
    getUpcoming: getUpcomingMockEvents,
  },
  groups: {
    getById: getMockGroupById,
    getRandom: getRandomMockGroup,
    getMultiple: getMockGroups,
    getByVisibility: getMockGroupsByVisibility,
  },
};

// Feature flag for using mock data (can be controlled via env or settings)
export const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true' || __DEV__;
