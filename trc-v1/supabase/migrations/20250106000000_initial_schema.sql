-- The Ribbon Club - Initial Database Schema
-- MVP scope: Auth, Profiles, Sensory Settings, Matching, Chat, Events, Safety

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA extensions; -- Optional, for geo features
CREATE EXTENSION IF NOT EXISTS "earthdistance" CASCADE; -- For distance queries

-- ============================================================================
-- PROFILES & USER DATA
-- ============================================================================

-- Core user profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    pronouns TEXT,
    bio TEXT,
    photos TEXT[] DEFAULT '{}', -- Array of photo URLs
    interests TEXT[] DEFAULT '{}', -- Interest tags
    boundaries JSONB DEFAULT '{}', -- Communication preferences: {pace, topics_to_avoid}
    location_lat DECIMAL(10, 8), -- Exact location (private)
    location_lng DECIMAL(11, 8), -- Exact location (private)
    location_fuzzy_lat DECIMAL(10, 8), -- Fuzzed location (public, ~2-3km radius)
    location_fuzzy_lng DECIMAL(11, 8), -- Fuzzed location (public)
    onboarding_completed BOOLEAN DEFAULT FALSE,
    profile_completeness INTEGER DEFAULT 0, -- Percentage 0-100
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_completeness CHECK (profile_completeness >= 0 AND profile_completeness <= 100)
);

-- Sensory profiles for accessibility
CREATE TABLE sensory_profiles (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    motion_ok BOOLEAN DEFAULT TRUE, -- Allow animations
    high_contrast BOOLEAN DEFAULT FALSE, -- High contrast theme
    haptics_ok BOOLEAN DEFAULT TRUE, -- Allow haptic feedback
    content_filters JSONB DEFAULT '{}', -- {flashing_lights: false, loud_sounds: false}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MATCHING SYSTEM
-- ============================================================================

-- Likes (one-directional)
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    liked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(liker_id, liked_id),
    CHECK (liker_id != liked_id)
);

-- Matches (mutual likes)
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'mutual' CHECK (status IN ('pending', 'mutual', 'blocked')),
    score NUMERIC(5, 2) DEFAULT 0, -- Interest overlap score (0-100)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Ensure ordered pair (user_a < user_b) to prevent duplicates
    CHECK (user_a < user_b),
    UNIQUE(user_a, user_b)
);

-- Create index for ordered pair lookups
CREATE UNIQUE INDEX idx_matches_ordered_pair ON matches(LEAST(user_a, user_b), GREATEST(user_a, user_b));

-- ============================================================================
-- CHAT SYSTEM
-- ============================================================================

-- Conversations container
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE conversation_participants (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    PRIMARY KEY (conversation_id, user_id)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    text TEXT,
    media_url TEXT, -- Pre-signed URL for images
    moderation_flags JSONB DEFAULT '{}', -- {flagged: false, reason: null}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (text IS NOT NULL OR media_url IS NOT NULL)
);

-- Index for efficient message queries
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- ============================================================================
-- GROUPS & EVENTS
-- ============================================================================

-- Community groups
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    rules TEXT,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group memberships
CREATE TABLE group_members (
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'owner')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

-- Events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    venue_json JSONB, -- {name, address, coordinates, accessibility}
    capacity INTEGER,
    accessibility_notes TEXT, -- Wheelchair access, quiet spaces, etc.
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (ends_at IS NULL OR ends_at > starts_at)
);

-- Event RSVPs
CREATE TABLE rsvps (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'going' CHECK (status IN ('going', 'waitlist', 'declined')),
    checked_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, event_id)
);

-- ============================================================================
-- SAFETY & MODERATION
-- ============================================================================

-- User blocks
CREATE TABLE blocks (
    blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);

-- Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject_type TEXT NOT NULL CHECK (subject_type IN ('user', 'message', 'event', 'group')),
    subject_id UUID NOT NULL, -- Polymorphic reference
    reason TEXT NOT NULL, -- Category: harassment, spam, inappropriate_content, etc.
    details TEXT, -- Free text explanation
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'resolved', 'dismissed')),
    moderator_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for moderator queue
CREATE INDEX idx_reports_status ON reports(status, created_at DESC);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- Push notification tokens
CREATE TABLE notification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    matches BOOLEAN DEFAULT TRUE,
    messages BOOLEAN DEFAULT TRUE,
    events BOOLEAN DEFAULT TRUE,
    rsvp_updates BOOLEAN DEFAULT TRUE,
    quiet_hours_start TIME, -- e.g., '22:00'
    quiet_hours_end TIME, -- e.g., '08:00'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

-- System audit trail
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g., 'user.blocked', 'report.created', 'match.created'
    subject_type TEXT,
    subject_id UUID,
    meta JSONB DEFAULT '{}', -- Additional context
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit queries
CREATE INDEX idx_audit_actor ON audit_log(actor_id, created_at DESC);
CREATE INDEX idx_audit_subject ON audit_log(subject_type, subject_id, created_at DESC);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sensory_profiles_updated_at BEFORE UPDATE ON sensory_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER groups_updated_at BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER rsvps_updated_at BEFORE UPDATE ON rsvps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create sensory profile on user signup
CREATE OR REPLACE FUNCTION create_sensory_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO sensory_profiles (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION create_sensory_profile();

-- Create notification preferences on user signup
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created_notif_prefs
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION create_notification_preferences();

-- Update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER group_members_count
    AFTER INSERT OR DELETE ON group_members
    FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profile lookups
CREATE INDEX idx_profiles_location ON profiles USING GIST(
    ll_to_earth(location_fuzzy_lat::float8, location_fuzzy_lng::float8)
) WHERE location_fuzzy_lat IS NOT NULL; -- For distance queries (requires earthdistance)

CREATE INDEX idx_profiles_interests ON profiles USING GIN(interests);
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_completed);

-- Matching
CREATE INDEX idx_likes_liker ON likes(liker_id, created_at DESC);
CREATE INDEX idx_likes_liked ON likes(liked_id, created_at DESC);
CREATE INDEX idx_matches_user_a ON matches(user_a, created_at DESC);
CREATE INDEX idx_matches_user_b ON matches(user_b, created_at DESC);

-- Chat
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);

-- Events
CREATE INDEX idx_events_starts_at ON events(starts_at);
CREATE INDEX idx_events_group ON events(group_id, starts_at DESC);
CREATE INDEX idx_rsvps_event ON rsvps(event_id, status);
CREATE INDEX idx_rsvps_user ON rsvps(user_id, created_at DESC);

-- Safety
CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);

-- Comments
COMMENT ON TABLE profiles IS 'Core user profile data';
COMMENT ON TABLE sensory_profiles IS 'Accessibility and sensory preferences per user';
COMMENT ON TABLE matches IS 'Mutual matches between users (user_a < user_b enforced)';
COMMENT ON TABLE conversations IS 'Chat conversation containers';
COMMENT ON TABLE messages IS 'Chat messages within conversations';
COMMENT ON TABLE events IS 'Community events with RSVP capacity';
COMMENT ON TABLE reports IS 'User-generated reports for moderation';
COMMENT ON TABLE audit_log IS 'Immutable audit trail for safety-critical actions';
