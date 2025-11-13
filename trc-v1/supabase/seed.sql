-- The Ribbon Club - Development Seed Data
-- Sample data for local testing

-- Note: In real development, you would create test users via Supabase Auth first
-- These UUIDs should match actual auth.users entries

-- Sample interests for testing
DO $$
DECLARE
    user1_id UUID := '00000000-0000-0000-0000-000000000001';
    user2_id UUID := '00000000-0000-0000-0000-000000000002';
    user3_id UUID := '00000000-0000-0000-0000-000000000003';
BEGIN
    -- Sample profiles (requires corresponding auth.users entries)
    -- These are examples; in practice, profiles are created via trigger on auth signup

    -- You can add sample data here after creating test users via Supabase Auth UI
    -- Example:
    /*
    INSERT INTO profiles (id, display_name, pronouns, bio, interests, onboarding_completed)
    VALUES
        (user1_id, 'Alex Chen', 'they/them', 'Love hiking and board games!',
         ARRAY['hiking', 'board-games', 'sci-fi', 'cooking'], TRUE),
        (user2_id, 'Jordan Smith', 'she/her', 'Artist and coffee enthusiast ☕',
         ARRAY['art', 'coffee', 'photography', 'hiking'], TRUE),
        (user3_id, 'Sam Taylor', 'he/him', 'Tech nerd and musician',
         ARRAY['music', 'tech', 'board-games', 'gaming'], TRUE);
    */

    RAISE NOTICE 'Seed data would be inserted here. Create test users via Supabase Auth UI first.';
END $$;

-- Sample groups
-- INSERT INTO groups (name, description, tags, visibility, owner_id)
-- VALUES
--     ('Weekend Hikers', 'Casual hikes every weekend', ARRAY['hiking', 'outdoors', 'nature'], 'public', user1_id),
--     ('Board Game Night', 'Weekly meetup for tabletop games', ARRAY['board-games', 'social', 'indoor'], 'public', user3_id);

-- Sample events
-- INSERT INTO events (group_id, host_id, title, description, starts_at, ends_at, capacity, accessibility_notes)
-- VALUES
--     ((SELECT id FROM groups WHERE name = 'Weekend Hikers' LIMIT 1),
--      user1_id,
--      'Sunrise Hike at Mt. Tam',
--      'Easy 5-mile trail with beautiful views',
--      NOW() + INTERVAL '7 days',
--      NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
--      12,
--      'Moderate incline, not wheelchair accessible');
