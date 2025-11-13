// Mock group data for testing and development
export const mockGroups = [
  {
    id: 'mock-group-1',
    name: 'Neurodivergent Coffee Lovers',
    description:
      'A community for neurodivergent folks who love coffee, cozy cafés, and low-key hangouts. We organize regular coffee meetups in sensory-friendly locations, discuss our favorite brewing methods, and share café recommendations. Everyone from coffee newbies to aficionados welcome!',
    visibility: 'public',
    member_count: 47,
    tags: ['Coffee', 'Social', 'Low-Key', 'Sensory-Friendly', 'Meetups'],
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
    members: [
      {
        user_id: 'mock-profile-1',
        role: 'admin',
        profiles: {
          display_name: 'Alex Rivera',
          photos: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-5',
        role: 'moderator',
        profiles: {
          display_name: 'Riley Park',
          photos: ['https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-3',
        role: 'member',
        profiles: {
          display_name: 'Sam Chen',
          photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'],
        },
      },
    ],
    upcoming_events: [
      {
        id: 'mock-event-1',
        title: 'Quiet Coffee Meetup',
        starts_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        venue_json: { name: 'Calm Grounds Café' },
      },
    ],
  },
  {
    id: 'mock-group-2',
    name: 'ADHD Creative Collective',
    description:
      'For creative folks with ADHD who want to work on projects together! We do body doubling sessions, share accountability tips, celebrate finished projects, and don\'t judge abandoned WIPs. Crafts, art, writing, music - all creative pursuits welcome. Let\'s harness our hyperfocus together!',
    visibility: 'public',
    member_count: 89,
    tags: ['ADHD', 'Creativity', 'Body Doubling', 'Crafts', 'Art', 'Accountability'],
    created_at: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(), // 8 months ago
    members: [
      {
        user_id: 'mock-profile-2',
        role: 'admin',
        profiles: {
          display_name: 'Jordan Lee',
          photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-4',
        role: 'member',
        profiles: {
          display_name: 'Taylor Morgan',
          photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-6',
        role: 'member',
        profiles: {
          display_name: 'Casey Williams',
          photos: ['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop'],
        },
      },
    ],
    upcoming_events: [
      {
        id: 'mock-event-2',
        title: 'ADHD Crafting Circle',
        starts_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        venue_json: { name: 'Community Arts Center' },
      },
    ],
  },
  {
    id: 'mock-group-3',
    name: 'Outdoor Friends',
    description:
      'Nature-loving neurodivergent people unite! We organize accessible outdoor activities like easy hikes, park meetups, botanical garden visits, and nature photography walks. All activities are paced gently with plenty of rest breaks. Perfect for those who find nature calming and rejuvenating.',
    visibility: 'public',
    member_count: 63,
    tags: ['Nature', 'Hiking', 'Photography', 'Outdoors', 'Accessible', 'Gentle Pace'],
    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(), // 5 months ago
    members: [
      {
        user_id: 'mock-profile-3',
        role: 'admin',
        profiles: {
          display_name: 'Sam Chen',
          photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-1',
        role: 'member',
        profiles: {
          display_name: 'Alex Rivera',
          photos: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-2',
        role: 'member',
        profiles: {
          display_name: 'Jordan Lee',
          photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'],
        },
      },
    ],
    upcoming_events: [
      {
        id: 'mock-event-3',
        title: 'Nature Walk & Photography',
        starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        venue_json: { name: 'Riverside Botanical Gardens' },
      },
    ],
  },
  {
    id: 'mock-group-4',
    name: 'ND Gamers Unite',
    description:
      'Gaming community for neurodivergent folks! We play board games, video games, TTRPGs, and more. Our events are always sensory-considerate with options for quiet spaces. Whether you\'re into competitive gaming or cozy co-op, there\'s a place for you here. Rage-quitting is understood and respected!',
    visibility: 'public',
    member_count: 124,
    tags: ['Gaming', 'Board Games', 'Video Games', 'TTRPG', 'D&D', 'Sensory-Friendly'],
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
    members: [
      {
        user_id: 'mock-profile-5',
        role: 'admin',
        profiles: {
          display_name: 'Riley Park',
          photos: ['https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-2',
        role: 'moderator',
        profiles: {
          display_name: 'Jordan Lee',
          photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-4',
        role: 'member',
        profiles: {
          display_name: 'Taylor Morgan',
          photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'],
        },
      },
    ],
    upcoming_events: [
      {
        id: 'mock-event-4',
        title: 'Board Game Night - Low Sensory',
        starts_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        venue_json: { name: 'Nexus Game Lounge' },
      },
    ],
  },
  {
    id: 'mock-group-5',
    name: 'Neurodivergent Writers Circle',
    description:
      'A supportive community for neurodivergent writers of all genres and skill levels. We share work, give feedback, do writing sprints, and discuss the unique challenges and strengths of neurodivergent creativity. Poetry, fiction, non-fiction, fanfic - all writing is valid and welcome here!',
    visibility: 'public',
    member_count: 52,
    tags: ['Writing', 'Poetry', 'Fiction', 'Creative Writing', 'Support', 'Feedback'],
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(), // ~6.5 months ago
    members: [
      {
        user_id: 'mock-profile-3',
        role: 'admin',
        profiles: {
          display_name: 'Sam Chen',
          photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-6',
        role: 'moderator',
        profiles: {
          display_name: 'Casey Williams',
          photos: ['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-1',
        role: 'member',
        profiles: {
          display_name: 'Alex Rivera',
          photos: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'],
        },
      },
    ],
    upcoming_events: [
      {
        id: 'mock-event-5',
        title: 'Poetry & Writing Workshop',
        starts_at: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        venue_json: { name: 'The Word Loft' },
      },
    ],
  },
  {
    id: 'mock-group-6',
    name: 'Autistic Adults Social Club',
    description:
      'A social group specifically for autistic adults to connect, share experiences, and build friendships. We organize structured hangouts, info-dumping sessions (yes, really!), special interest meetups, and sensory-friendly activities. Masking-optional zone - be your authentic self!',
    visibility: 'public',
    member_count: 78,
    tags: ['Autism', 'Social', 'Friendship', 'Special Interests', 'Masking-Free', 'Community'],
    created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(), // 10 months ago
    members: [
      {
        user_id: 'mock-profile-1',
        role: 'admin',
        profiles: {
          display_name: 'Alex Rivera',
          photos: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-5',
        role: 'admin',
        profiles: {
          display_name: 'Riley Park',
          photos: ['https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop'],
        },
      },
    ],
    upcoming_events: [],
  },
  {
    id: 'mock-group-7',
    name: 'Mental Health & Wellness',
    description:
      'A peer support group focused on mental health, self-care, and wellness strategies that work for neurodivergent folks. We discuss coping mechanisms, share resources, practice self-compassion, and support each other through difficult times. Professional facilitation available for some sessions.',
    visibility: 'public',
    member_count: 95,
    tags: ['Mental Health', 'Self-Care', 'Support', 'Wellness', 'Peer Support', 'Resources'],
    created_at: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString(), // 9 months ago
    members: [
      {
        user_id: 'mock-profile-6',
        role: 'admin',
        profiles: {
          display_name: 'Casey Williams',
          photos: ['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-3',
        role: 'member',
        profiles: {
          display_name: 'Sam Chen',
          photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'],
        },
      },
    ],
    upcoming_events: [],
  },
  {
    id: 'mock-group-8',
    name: 'Music & Sound Explorers',
    description:
      'For music lovers, musicians, and those with unique auditory experiences (including synesthesia!). We attend concerts together, have jam sessions, discuss sound sensitivity, share playlists, and explore how neurodivergence shapes our relationship with music. All instruments and skill levels welcome.',
    visibility: 'public',
    member_count: 41,
    tags: ['Music', 'Musicians', 'Concerts', 'Synesthesia', 'Jam Sessions', 'Auditory'],
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 4 months ago
    members: [
      {
        user_id: 'mock-profile-4',
        role: 'admin',
        profiles: {
          display_name: 'Taylor Morgan',
          photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-2',
        role: 'member',
        profiles: {
          display_name: 'Jordan Lee',
          photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'],
        },
      },
    ],
    upcoming_events: [],
  },
];

// Helper function to get a random mock group
export function getRandomMockGroup() {
  return mockGroups[Math.floor(Math.random() * mockGroups.length)];
}

// Helper function to get a mock group by ID
export function getMockGroupById(id: string) {
  return mockGroups.find((group) => group.id === id) || mockGroups[0];
}

// Helper function to get multiple mock groups
export function getMockGroups(count: number = 10) {
  const groups = [];
  for (let i = 0; i < count; i++) {
    groups.push(mockGroups[i % mockGroups.length]);
  }
  return groups;
}

// Helper function to get groups by visibility
export function getMockGroupsByVisibility(visibility: 'public' | 'private') {
  return mockGroups.filter((group) => group.visibility === visibility);
}
