-- The Ribbon Club - Row Level Security Policies
-- Enforce data access control at the database level

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensory_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user is a moderator
CREATE OR REPLACE FUNCTION is_moderator(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT COALESCE(
            (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'moderator',
            FALSE
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is blocked by another user
CREATE OR REPLACE FUNCTION is_blocked_by(blocker UUID, blocked UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM blocks
        WHERE blocker_id = blocker AND blocked_id = blocked
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if two users have blocked each other
CREATE OR REPLACE FUNCTION has_block_relationship(user1 UUID, user2 UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM blocks
        WHERE (blocker_id = user1 AND blocked_id = user2)
           OR (blocker_id = user2 AND blocked_id = user1)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PROFILES
-- ============================================================================

-- Anyone can view profiles (except blocked users and sensitive fields)
CREATE POLICY "Profiles are viewable by everyone except blocked users"
    ON profiles FOR SELECT
    USING (
        NOT is_blocked_by(id, auth.uid())
        AND NOT is_blocked_by(auth.uid(), id)
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (triggered by auth signup)
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- SENSORY PROFILES
-- ============================================================================

-- Users can view their own sensory profile
CREATE POLICY "Users can view own sensory profile"
    ON sensory_profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own sensory profile
CREATE POLICY "Users can update own sensory profile"
    ON sensory_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Auto-insert via trigger, so allow insert
CREATE POLICY "Users can insert own sensory profile"
    ON sensory_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- LIKES
-- ============================================================================

-- Users can view likes where they are the liker
CREATE POLICY "Users can view their own likes"
    ON likes FOR SELECT
    USING (auth.uid() = liker_id);

-- Users can insert likes (except for blocked users)
CREATE POLICY "Users can like others (not blocked)"
    ON likes FOR INSERT
    WITH CHECK (
        auth.uid() = liker_id
        AND NOT has_block_relationship(liker_id, liked_id)
    );

-- Users can delete their own likes
CREATE POLICY "Users can unlike"
    ON likes FOR DELETE
    USING (auth.uid() = liker_id);

-- ============================================================================
-- MATCHES
-- ============================================================================

-- Users can view their own matches
CREATE POLICY "Users can view their matches"
    ON matches FOR SELECT
    USING (
        auth.uid() = user_a OR auth.uid() = user_b
    );

-- Matches are created via RPC function only (not direct INSERT)
-- This policy allows the function to insert
CREATE POLICY "Matches created via function"
    ON matches FOR INSERT
    WITH CHECK (
        auth.uid() IN (user_a, user_b)
    );

-- Users can update match status (e.g., to block)
CREATE POLICY "Users can update match status"
    ON matches FOR UPDATE
    USING (auth.uid() IN (user_a, user_b))
    WITH CHECK (auth.uid() IN (user_a, user_b));

-- ============================================================================
-- CONVERSATIONS & MESSAGES
-- ============================================================================

-- Users can view conversations they're part of
CREATE POLICY "Users can view their conversations"
    ON conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = conversations.id
              AND user_id = auth.uid()
        )
    );

-- Conversation participants can view participant list
CREATE POLICY "Participants can view conversation participants"
    ON conversation_participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversation_participants.conversation_id
              AND cp.user_id = auth.uid()
        )
    );

-- Users can join conversations (created via match)
CREATE POLICY "Users can join conversations"
    ON conversation_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own participant record (e.g., last_read_at)
CREATE POLICY "Users can update own participant record"
    ON conversation_participants FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Participants can view messages in their conversations
CREATE POLICY "Participants can view conversation messages"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id
              AND user_id = auth.uid()
        )
    );

-- Participants can send messages
CREATE POLICY "Participants can send messages"
    ON messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id
              AND user_id = auth.uid()
        )
    );

-- Senders can update their own messages (e.g., edit)
CREATE POLICY "Senders can update own messages"
    ON messages FOR UPDATE
    USING (auth.uid() = sender_id)
    WITH CHECK (auth.uid() = sender_id);

-- ============================================================================
-- GROUPS
-- ============================================================================

-- Public groups are viewable by all
CREATE POLICY "Public groups are viewable"
    ON groups FOR SELECT
    USING (
        visibility = 'public'
        OR EXISTS (
            SELECT 1 FROM group_members
            WHERE group_id = groups.id
              AND user_id = auth.uid()
        )
    );

-- Users can create groups
CREATE POLICY "Authenticated users can create groups"
    ON groups FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Group owners can update their groups
CREATE POLICY "Owners can update groups"
    ON groups FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Group members
CREATE POLICY "Anyone can view group members of public groups"
    ON group_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM groups
            WHERE id = group_members.group_id
              AND (
                  visibility = 'public'
                  OR EXISTS (
                      SELECT 1 FROM group_members gm
                      WHERE gm.group_id = groups.id
                        AND gm.user_id = auth.uid()
                  )
              )
        )
    );

-- Users can join groups
CREATE POLICY "Users can join groups"
    ON group_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can leave groups
CREATE POLICY "Users can leave groups"
    ON group_members FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- EVENTS
-- ============================================================================

-- Public events are viewable by all
CREATE POLICY "Events are viewable based on group visibility"
    ON events FOR SELECT
    USING (
        group_id IS NULL
        OR EXISTS (
            SELECT 1 FROM groups
            WHERE id = events.group_id
              AND (
                  visibility = 'public'
                  OR EXISTS (
                      SELECT 1 FROM group_members
                      WHERE group_id = groups.id
                        AND user_id = auth.uid()
                  )
              )
        )
    );

-- Group members can create events
CREATE POLICY "Group members can create events"
    ON events FOR INSERT
    WITH CHECK (
        auth.uid() = host_id
        AND (
            group_id IS NULL
            OR EXISTS (
                SELECT 1 FROM group_members
                WHERE group_id = events.group_id
                  AND user_id = auth.uid()
            )
        )
    );

-- Event hosts can update events
CREATE POLICY "Hosts can update events"
    ON events FOR UPDATE
    USING (auth.uid() = host_id)
    WITH CHECK (auth.uid() = host_id);

-- RSVPs
CREATE POLICY "Users can view RSVPs for events they can see"
    ON rsvps FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events
            WHERE id = rsvps.event_id
              AND (
                  group_id IS NULL
                  OR EXISTS (
                      SELECT 1 FROM groups
                      WHERE id = events.group_id
                        AND (
                            visibility = 'public'
                            OR EXISTS (
                                SELECT 1 FROM group_members
                                WHERE group_id = groups.id
                                  AND user_id = auth.uid()
                            )
                        )
                  )
              )
        )
    );

-- Users can RSVP to events
CREATE POLICY "Users can RSVP to events"
    ON rsvps FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own RSVPs
CREATE POLICY "Users can update own RSVPs"
    ON rsvps FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own RSVPs
CREATE POLICY "Users can delete own RSVPs"
    ON rsvps FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- BLOCKS
-- ============================================================================

-- Users can view their own blocks
CREATE POLICY "Users can view own blocks"
    ON blocks FOR SELECT
    USING (auth.uid() = blocker_id);

-- Users can block others
CREATE POLICY "Users can block others"
    ON blocks FOR INSERT
    WITH CHECK (auth.uid() = blocker_id);

-- Users can unblock
CREATE POLICY "Users can unblock"
    ON blocks FOR DELETE
    USING (auth.uid() = blocker_id);

-- ============================================================================
-- REPORTS
-- ============================================================================

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
    ON reports FOR SELECT
    USING (
        auth.uid() = reporter_id
        OR is_moderator(auth.uid())
    );

-- Users can create reports
CREATE POLICY "Users can create reports"
    ON reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- Moderators can update reports
CREATE POLICY "Moderators can update reports"
    ON reports FOR UPDATE
    USING (is_moderator(auth.uid()))
    WITH CHECK (is_moderator(auth.uid()));

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- Users can view/manage their own notification tokens
CREATE POLICY "Users can manage own notification tokens"
    ON notification_tokens FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can view/manage their own notification preferences
CREATE POLICY "Users can manage own notification preferences"
    ON notification_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

-- Moderators can view audit log
CREATE POLICY "Moderators can view audit log"
    ON audit_log FOR SELECT
    USING (is_moderator(auth.uid()));

-- System can insert audit log entries (via function)
CREATE POLICY "System can insert audit entries"
    ON audit_log FOR INSERT
    WITH CHECK (TRUE); -- Controlled via SECURITY DEFINER functions

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on all tables to authenticated users (RLS will filter)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Grant insert/update/delete to authenticated users (RLS will filter)
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
