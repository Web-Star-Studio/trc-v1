// Mock event data for testing and development
export const mockEvents = [
  {
    id: 'mock-event-1',
    title: 'Quiet Coffee Meetup',
    description:
      'A low-key coffee meetup for neurodivergent folks who prefer quieter social settings. We\'ll meet at a sensory-friendly café with plenty of natural light and soft background music. Feel free to bring noise-cancelling headphones or stim toys. No pressure to talk constantly - comfortable silences are welcome!',
    starts_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
    venue_json: {
      name: 'Calm Grounds Café',
      address: '123 Peaceful Street, Downtown',
      coordinates: { lat: 40.7128, lng: -74.006 },
      accessibility: 'Wheelchair accessible, quiet environment, natural lighting',
    },
    host: {
      id: 'mock-profile-1',
      display_name: 'Alex Rivera',
      photos: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'],
    },
    group: {
      id: 'mock-group-1',
      name: 'Neurodivergent Coffee Lovers',
      member_count: 47,
    },
    capacity: 12,
    accessibility_notes:
      'Quiet space with minimal sensory triggers. Step-free access. Gender-neutral bathroom available. Please let host know of any specific needs in advance.',
    attendees: [
      {
        user_id: 'mock-profile-2',
        status: 'going',
        profiles: {
          display_name: 'Jordan Lee',
          photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-3',
        status: 'going',
        profiles: {
          display_name: 'Sam Chen',
          photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-5',
        status: 'going',
        profiles: {
          display_name: 'Riley Park',
          photos: ['https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop'],
        },
      },
    ],
  },
  {
    id: 'mock-event-2',
    title: 'ADHD Crafting Circle',
    description:
      'Bring your unfinished projects! This is a judgment-free zone for starting new crafts, working on old WIPs, or just chatting about your latest hyperfixation. We provide basic supplies, snacks, and ADHD-friendly timers. Body doubling welcome!',
    starts_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 hours later
    venue_json: {
      name: 'Community Arts Center',
      address: '456 Creative Avenue, Arts District',
      coordinates: { lat: 40.7282, lng: -73.9942 },
      accessibility: 'Elevator access, fidget toys available',
    },
    host: {
      id: 'mock-profile-2',
      display_name: 'Jordan Lee',
      photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'],
    },
    group: {
      id: 'mock-group-2',
      name: 'ADHD Creative Collective',
      member_count: 89,
    },
    capacity: 20,
    accessibility_notes:
      'Elevator to 3rd floor. Fidget-friendly environment. Bathroom breaks encouraged anytime. Scent-free space requested.',
    attendees: [
      {
        user_id: 'mock-profile-1',
        status: 'going',
        profiles: {
          display_name: 'Alex Rivera',
          photos: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-4',
        status: 'going',
        profiles: {
          display_name: 'Taylor Morgan',
          photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-6',
        status: 'going',
        profiles: {
          display_name: 'Casey Williams',
          photos: ['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop'],
        },
      },
    ],
  },
  {
    id: 'mock-event-3',
    title: 'Nature Walk & Photography',
    description:
      'Join us for a gentle-paced nature walk through the botanical gardens. Bring your camera or phone to capture the beauty around us. We\'ll have several rest stops and no one will be rushed. Perfect for those who prefer outdoor social activities.',
    starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString(), // 2.5 hours later
    venue_json: {
      name: 'Riverside Botanical Gardens',
      address: '789 Garden Path, Green Park',
      coordinates: { lat: 40.7589, lng: -73.9851 },
      accessibility: 'Paved paths, benches throughout, mobility device accessible',
    },
    host: {
      id: 'mock-profile-3',
      display_name: 'Sam Chen',
      photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'],
    },
    group: {
      id: 'mock-group-3',
      name: 'Outdoor Friends',
      member_count: 63,
    },
    capacity: 15,
    accessibility_notes:
      'Fully paved paths suitable for wheelchairs and mobility devices. Multiple rest areas with seating. Bathroom facilities at entrance and midpoint. Sunscreen recommended.',
    attendees: [
      {
        user_id: 'mock-profile-1',
        status: 'going',
        profiles: {
          display_name: 'Alex Rivera',
          photos: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-2',
        status: 'going',
        profiles: {
          display_name: 'Jordan Lee',
          photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'],
        },
      },
    ],
  },
  {
    id: 'mock-event-4',
    title: 'Board Game Night - Low Sensory',
    description:
      'Monthly board game night in a low-sensory environment. We dim the lights, keep volume low, and play cooperative games. Bring your favorites or try something new from our collection. Communication cards available for non-verbal moments.',
    starts_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    ends_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
    venue_json: {
      name: 'Nexus Game Lounge',
      address: '321 Player Street, Entertainment Quarter',
      coordinates: { lat: 40.7489, lng: -73.9680 },
      accessibility: 'Ground floor access, adjustable lighting, quiet room available',
    },
    host: {
      id: 'mock-profile-5',
      display_name: 'Riley Park',
      photos: ['https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop'],
    },
    group: {
      id: 'mock-group-4',
      name: 'ND Gamers Unite',
      member_count: 124,
    },
    capacity: 18,
    accessibility_notes:
      'Ground floor location. Dimmed lighting available. Quiet breakout room for overwhelm. Communication cards provided. No strong scents policy.',
    attendees: [
      {
        user_id: 'mock-profile-2',
        status: 'going',
        profiles: {
          display_name: 'Jordan Lee',
          photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-4',
        status: 'going',
        profiles: {
          display_name: 'Taylor Morgan',
          photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-1',
        status: 'going',
        profiles: {
          display_name: 'Alex Rivera',
          photos: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-6',
        status: 'going',
        profiles: {
          display_name: 'Casey Williams',
          photos: ['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop'],
        },
      },
    ],
  },
  {
    id: 'mock-event-5',
    title: 'Poetry & Writing Workshop',
    description:
      'A safe space for neurodivergent writers to share their work and get supportive feedback. We\'ll do writing prompts, share poems, and discuss our creative processes. All skill levels welcome. No pressure to share if you\'re not comfortable.',
    starts_at: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days from now
    ends_at: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
    venue_json: {
      name: 'The Word Loft',
      address: '567 Literary Lane, Booktown',
      coordinates: { lat: 40.7308, lng: -73.9973 },
      accessibility: 'Second floor with elevator, quiet space, cozy seating',
    },
    host: {
      id: 'mock-profile-3',
      display_name: 'Sam Chen',
      photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'],
    },
    group: {
      id: 'mock-group-5',
      name: 'Neurodivergent Writers Circle',
      member_count: 52,
    },
    capacity: 12,
    accessibility_notes:
      'Elevator access to 2nd floor. Comfortable seating with cushions. Natural lighting. Quiet environment. Water and tea provided.',
    attendees: [
      {
        user_id: 'mock-profile-6',
        status: 'going',
        profiles: {
          display_name: 'Casey Williams',
          photos: ['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-1',
        status: 'going',
        profiles: {
          display_name: 'Alex Rivera',
          photos: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'],
        },
      },
    ],
  },
  {
    id: 'mock-event-6',
    title: 'Movie Night: Cozy Edition',
    description:
      'Watch a neurodivergent-affirming film in a comfortable, sensory-friendly environment. Bean bags, blankets, and stim toys provided. Volume will be moderate with subtitles. Come and go as needed - no judgment!',
    starts_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 hours later
    venue_json: {
      name: 'Community Center Lounge',
      address: '890 Together Street, Central',
      coordinates: { lat: 40.7614, lng: -73.9776 },
      accessibility: 'Ground floor, adjustable seating, sensory room adjacent',
    },
    host: {
      id: 'mock-profile-4',
      display_name: 'Taylor Morgan',
      photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'],
    },
    group: {
      id: 'mock-group-1',
      name: 'Neurodivergent Coffee Lovers',
      member_count: 47,
    },
    capacity: 25,
    accessibility_notes:
      'Ground floor access. Bean bags and floor seating available. Sensory room next door for breaks. Moderate volume with subtitles always on. Gluten-free snacks available.',
    attendees: [
      {
        user_id: 'mock-profile-5',
        status: 'going',
        profiles: {
          display_name: 'Riley Park',
          photos: ['https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-2',
        status: 'going',
        profiles: {
          display_name: 'Jordan Lee',
          photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'],
        },
      },
      {
        user_id: 'mock-profile-3',
        status: 'going',
        profiles: {
          display_name: 'Sam Chen',
          photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'],
        },
      },
    ],
  },
];

// Helper function to get a random mock event
export function getRandomMockEvent() {
  return mockEvents[Math.floor(Math.random() * mockEvents.length)];
}

// Helper function to get a mock event by ID
export function getMockEventById(id: string) {
  return mockEvents.find((event) => event.id === id) || mockEvents[0];
}

// Helper function to get multiple mock events
export function getMockEvents(count: number = 10) {
  const events = [];
  for (let i = 0; i < count; i++) {
    events.push(mockEvents[i % mockEvents.length]);
  }
  return events;
}

// Helper function to get upcoming mock events (sorted by date)
export function getUpcomingMockEvents() {
  return [...mockEvents].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
  );
}
