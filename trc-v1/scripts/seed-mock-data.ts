// Seed script to upload mock data to Supabase
// Run with: npx tsx scripts/seed-mock-data.ts

import { createClient } from '@supabase/supabase-js';
import { mockProfiles } from '../lib/mock/profiles';
import { mockEvents } from '../lib/mock/events';
import { mockGroups } from '../lib/mock/groups';

// Load environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Make sure EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function seedProfiles() {
  console.log('\n📝 Seeding profiles...');

  for (const profile of mockProfiles) {
    try {
      // First, create an auth user (or use existing)
      const userId = generateUUID();

      // Insert profile
      const { error } = await supabase.from('profiles').insert({
        id: userId,
        display_name: profile.displayName,
        pronouns: profile.pronouns,
        bio: profile.bio,
        photos: profile.photos,
        interests: profile.interests,
        relationship_preferences: profile.relationshipPreferences,
        neurodivergence: profile.neurodivergence,
        accessibility_needs: profile.accessibilityNeeds,
        onboarding_completed: true,
        profile_completeness: 100,
      });

      if (error) {
        console.error(`  ❌ Error inserting ${profile.displayName}:`, error.message);
      } else {
        console.log(`  ✅ Inserted profile: ${profile.displayName} (${userId})`);
        // Store the mapping for later use
        (profile as any).realId = userId;
      }
    } catch (error: any) {
      console.error(`  ❌ Failed to insert ${profile.displayName}:`, error.message);
    }
  }
}

async function seedGroups() {
  console.log('\n👥 Seeding groups...');

  for (const group of mockGroups) {
    try {
      const groupId = generateUUID();

      const { error } = await supabase.from('groups').insert({
        id: groupId,
        name: group.name,
        description: group.description,
        visibility: group.visibility,
        tags: group.tags,
        member_count: group.member_count,
        created_at: group.created_at,
      });

      if (error) {
        console.error(`  ❌ Error inserting ${group.name}:`, error.message);
      } else {
        console.log(`  ✅ Inserted group: ${group.name} (${groupId})`);
        (group as any).realId = groupId;

        // Insert group members
        if (group.members && Array.isArray(group.members)) {
          for (const member of group.members) {
            const mockProfile = mockProfiles.find((p) => p.id === member.user_id);
            if (mockProfile && (mockProfile as any).realId) {
              await supabase.from('group_members').insert({
                group_id: groupId,
                user_id: (mockProfile as any).realId,
                role: member.role,
              });
            }
          }
          console.log(`    ➕ Added ${group.members.length} members`);
        }
      }
    } catch (error: any) {
      console.error(`  ❌ Failed to insert ${group.name}:`, error.message);
    }
  }
}

async function seedEvents() {
  console.log('\n📅 Seeding events...');

  for (const event of mockEvents) {
    try {
      const eventId = generateUUID();

      // Find the host's real ID
      const mockHost = mockProfiles.find((p) => p.id === event.host.id);
      const hostId = mockHost ? (mockHost as any).realId : null;

      // Find the group's real ID
      const mockGroup = mockGroups.find((g) => g.id === event.group.id);
      const groupId = mockGroup ? (mockGroup as any).realId : null;

      if (!hostId) {
        console.error(`  ❌ Host not found for event: ${event.title}`);
        continue;
      }

      const { error } = await supabase.from('events').insert({
        id: eventId,
        title: event.title,
        description: event.description,
        starts_at: event.starts_at,
        ends_at: event.ends_at,
        venue_json: event.venue_json,
        host_id: hostId,
        group_id: groupId,
        capacity: event.capacity,
        accessibility_notes: event.accessibility_notes,
      });

      if (error) {
        console.error(`  ❌ Error inserting ${event.title}:`, error.message);
      } else {
        console.log(`  ✅ Inserted event: ${event.title} (${eventId})`);

        // Insert RSVPs
        if (event.attendees && Array.isArray(event.attendees)) {
          for (const attendee of event.attendees) {
            const mockProfile = mockProfiles.find((p) => p.id === attendee.user_id);
            if (mockProfile && (mockProfile as any).realId) {
              await supabase.from('rsvps').insert({
                event_id: eventId,
                user_id: (mockProfile as any).realId,
                status: attendee.status || 'going',
              });
            }
          }
          console.log(`    ➕ Added ${event.attendees.length} RSVPs`);
        }
      }
    } catch (error: any) {
      console.error(`  ❌ Failed to insert ${event.title}:`, error.message);
    }
  }
}

async function main() {
  console.log('🌱 Starting mock data seed...\n');
  console.log('📊 Summary:');
  console.log(`  - ${mockProfiles.length} profiles`);
  console.log(`  - ${mockGroups.length} groups`);
  console.log(`  - ${mockEvents.length} events`);
  console.log('\n⚠️  WARNING: This will insert data into your Supabase database!');
  console.log('⚠️  Make sure you are connected to the correct database.\n');

  // Wait a moment for user to cancel if needed
  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    // Seed in order: profiles -> groups -> events
    await seedProfiles();
    await seedGroups();
    await seedEvents();

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`  ✅ ${mockProfiles.length} profiles inserted`);
    console.log(`  ✅ ${mockGroups.length} groups inserted`);
    console.log(`  ✅ ${mockEvents.length} events inserted`);
    console.log('\n🎉 Mock data is now available in your Supabase database!');
  } catch (error: any) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  }
}

// Run the seed
main();
