-- The Ribbon Club - Database Functions (RPC)
-- Server-side logic for matching, scoring, RSVPs, and reporting

-- ============================================================================
-- MATCHING FUNCTIONS
-- ============================================================================

-- Create or get match between two users
CREATE OR REPLACE FUNCTION create_or_get_match(target_user_id UUID)
RETURNS TABLE(
    match_id UUID,
    conversation_id UUID,
    is_new BOOLEAN
) AS $$
DECLARE
    current_user UUID := auth.uid();
    user_a UUID;
    user_b UUID;
    v_match_id UUID;
    v_conversation_id UUID;
    v_is_new BOOLEAN := FALSE;
    mutual_like BOOLEAN;
BEGIN
    -- Ensure users aren't blocked
    IF has_block_relationship(current_user, target_user_id) THEN
        RAISE EXCEPTION 'Cannot match with blocked user';
    END IF;

    -- Order users (user_a < user_b)
    IF current_user < target_user_id THEN
        user_a := current_user;
        user_b := target_user_id;
    ELSE
        user_a := target_user_id;
        user_b := current_user;
    END IF;

    -- Check if mutual like exists
    SELECT EXISTS(
        SELECT 1 FROM likes
        WHERE liker_id = current_user AND liked_id = target_user_id
    ) AND EXISTS(
        SELECT 1 FROM likes
        WHERE liker_id = target_user_id AND liked_id = current_user
    ) INTO mutual_like;

    IF NOT mutual_like THEN
        RAISE EXCEPTION 'Mutual like required for match';
    END IF;

    -- Check if match already exists
    SELECT id INTO v_match_id
    FROM matches
    WHERE matches.user_a = user_a AND matches.user_b = user_b;

    IF v_match_id IS NULL THEN
        -- Create new match
        INSERT INTO matches (user_a, user_b, status, score)
        VALUES (user_a, user_b, 'mutual', calculate_match_score(user_a, user_b))
        RETURNING id INTO v_match_id;

        -- Create conversation
        INSERT INTO conversations DEFAULT VALUES
        RETURNING id INTO v_conversation_id;

        -- Add both users as participants
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES
            (v_conversation_id, user_a),
            (v_conversation_id, user_b);

        -- Log to audit
        INSERT INTO audit_log (actor_id, action, subject_type, subject_id, meta)
        VALUES (
            current_user,
            'match.created',
            'match',
            v_match_id,
            jsonb_build_object('with_user', target_user_id)
        );

        v_is_new := TRUE;
    ELSE
        -- Get existing conversation
        SELECT cp.conversation_id INTO v_conversation_id
        FROM conversation_participants cp
        WHERE cp.user_id = current_user
        AND EXISTS (
            SELECT 1 FROM conversation_participants cp2
            WHERE cp2.conversation_id = cp.conversation_id
            AND cp2.user_id = target_user_id
        )
        LIMIT 1;
    END IF;

    RETURN QUERY SELECT v_match_id, v_conversation_id, v_is_new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate match score based on interest overlap
CREATE OR REPLACE FUNCTION calculate_match_score(user1 UUID, user2 UUID)
RETURNS NUMERIC AS $$
DECLARE
    interests1 TEXT[];
    interests2 TEXT[];
    overlap INTEGER;
    total INTEGER;
BEGIN
    SELECT interests INTO interests1 FROM profiles WHERE id = user1;
    SELECT interests INTO interests2 FROM profiles WHERE id = user2;

    -- Count overlapping interests
    SELECT COUNT(*) INTO overlap
    FROM unnest(interests1) AS i1
    WHERE i1 = ANY(interests2);

    -- Total unique interests
    SELECT COUNT(DISTINCT i) INTO total
    FROM unnest(interests1 || interests2) AS i;

    IF total = 0 THEN
        RETURN 0;
    END IF;

    -- Return percentage (0-100)
    RETURN ROUND((overlap::NUMERIC / total::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Score and rank candidates for discovery feed
CREATE OR REPLACE FUNCTION score_candidates(
    max_distance_km NUMERIC DEFAULT 50,
    interest_filters TEXT[] DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    user_id UUID,
    display_name TEXT,
    pronouns TEXT,
    bio TEXT,
    photos TEXT[],
    interests TEXT[],
    match_score NUMERIC,
    distance_km NUMERIC
) AS $$
DECLARE
    current_user UUID := auth.uid();
    user_lat DECIMAL;
    user_lng DECIMAL;
BEGIN
    -- Get current user's location
    SELECT location_fuzzy_lat, location_fuzzy_lng
    INTO user_lat, user_lng
    FROM profiles
    WHERE id = current_user;

    RETURN QUERY
    SELECT
        p.id,
        p.display_name,
        p.pronouns,
        p.bio,
        p.photos,
        p.interests,
        calculate_match_score(current_user, p.id) AS match_score,
        CASE
            WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL
                AND p.location_fuzzy_lat IS NOT NULL AND p.location_fuzzy_lng IS NOT NULL
            THEN earth_distance(
                ll_to_earth(user_lat::float8, user_lng::float8),
                ll_to_earth(p.location_fuzzy_lat::float8, p.location_fuzzy_lng::float8)
            ) / 1000 -- Convert to km
            ELSE NULL
        END AS distance_km
    FROM profiles p
    WHERE p.id != current_user
        AND p.onboarding_completed = TRUE
        -- Exclude if blocked
        AND NOT has_block_relationship(current_user, p.id)
        -- Exclude if already matched
        AND NOT EXISTS (
            SELECT 1 FROM matches m
            WHERE (m.user_a = current_user AND m.user_b = p.id)
               OR (m.user_a = p.id AND m.user_b = current_user)
        )
        -- Apply distance filter if location available
        AND (
            user_lat IS NULL OR user_lng IS NULL
            OR p.location_fuzzy_lat IS NULL OR p.location_fuzzy_lng IS NULL
            OR earth_distance(
                ll_to_earth(user_lat::float8, user_lng::float8),
                ll_to_earth(p.location_fuzzy_lat::float8, p.location_fuzzy_lng::float8)
            ) / 1000 <= max_distance_km
        )
        -- Apply interest filters if provided
        AND (
            interest_filters IS NULL
            OR p.interests && interest_filters -- Array overlap
        )
    ORDER BY match_score DESC, distance_km ASC NULLS LAST
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- EVENT RSVP FUNCTIONS
-- ============================================================================

-- RSVP to event with capacity enforcement
CREATE OR REPLACE FUNCTION rsvp_event(
    p_event_id UUID,
    p_status TEXT DEFAULT 'going'
)
RETURNS TABLE(
    rsvp_status TEXT,
    waitlist_position INTEGER,
    message TEXT
) AS $$
DECLARE
    current_user UUID := auth.uid();
    event_capacity INTEGER;
    current_going_count INTEGER;
    final_status TEXT;
    final_position INTEGER := NULL;
    final_message TEXT;
BEGIN
    -- Validate status
    IF p_status NOT IN ('going', 'waitlist', 'declined') THEN
        RAISE EXCEPTION 'Invalid RSVP status';
    END IF;

    -- Get event capacity
    SELECT capacity INTO event_capacity
    FROM events
    WHERE id = p_event_id;

    IF event_capacity IS NOT NULL THEN
        -- Count current "going" RSVPs
        SELECT COUNT(*) INTO current_going_count
        FROM rsvps
        WHERE event_id = p_event_id AND status = 'going';

        -- If requesting "going" but at capacity, force to waitlist
        IF p_status = 'going' AND current_going_count >= event_capacity THEN
            final_status := 'waitlist';
            final_message := 'Event at capacity, added to waitlist';
        ELSE
            final_status := p_status;
            final_message := 'RSVP successful';
        END IF;
    ELSE
        final_status := p_status;
        final_message := 'RSVP successful';
    END IF;

    -- Upsert RSVP
    INSERT INTO rsvps (user_id, event_id, status)
    VALUES (current_user, p_event_id, final_status)
    ON CONFLICT (user_id, event_id)
    DO UPDATE SET status = final_status, updated_at = NOW();

    -- Calculate position if on waitlist
    IF final_status = 'waitlist' THEN
        SELECT COUNT(*) INTO final_position
        FROM rsvps
        WHERE event_id = p_event_id
          AND status = 'waitlist'
          AND created_at <= (
              SELECT created_at FROM rsvps
              WHERE user_id = current_user AND event_id = p_event_id
          );
    END IF;

    -- Log to audit
    INSERT INTO audit_log (actor_id, action, subject_type, subject_id, meta)
    VALUES (
        current_user,
        'event.rsvp',
        'event',
        p_event_id,
        jsonb_build_object('status', final_status)
    );

    RETURN QUERY SELECT final_status AS rsvp_status, final_position AS waitlist_position, final_message AS message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-promote from waitlist when someone cancels
CREATE OR REPLACE FUNCTION promote_from_waitlist()
RETURNS TRIGGER AS $$
DECLARE
    event_capacity INTEGER;
    current_going_count INTEGER;
    next_waitlist_user UUID;
BEGIN
    -- Only process when status changes from 'going'
    IF OLD.status = 'going' AND NEW.status != 'going' THEN
        -- Get event capacity
        SELECT capacity INTO event_capacity
        FROM events
        WHERE id = OLD.event_id;

        IF event_capacity IS NOT NULL THEN
            -- Count current "going" RSVPs
            SELECT COUNT(*) INTO current_going_count
            FROM rsvps
            WHERE event_id = OLD.event_id AND status = 'going';

            -- If under capacity, promote next waitlist user
            IF current_going_count < event_capacity THEN
                SELECT user_id INTO next_waitlist_user
                FROM rsvps
                WHERE event_id = OLD.event_id AND status = 'waitlist'
                ORDER BY created_at ASC
                LIMIT 1;

                IF next_waitlist_user IS NOT NULL THEN
                    UPDATE rsvps
                    SET status = 'going', updated_at = NOW()
                    WHERE user_id = next_waitlist_user AND event_id = OLD.event_id;
                END IF;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rsvp_waitlist_promotion
    AFTER UPDATE ON rsvps
    FOR EACH ROW
    EXECUTE FUNCTION promote_from_waitlist();

-- ============================================================================
-- REPORTING FUNCTIONS
-- ============================================================================

-- Submit a report
CREATE OR REPLACE FUNCTION report_subject(
    p_subject_type TEXT,
    p_subject_id UUID,
    p_reason TEXT,
    p_details TEXT DEFAULT NULL,
    p_severity TEXT DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
    current_user UUID := auth.uid();
    report_id UUID;
BEGIN
    -- Validate subject type
    IF p_subject_type NOT IN ('user', 'message', 'event', 'group') THEN
        RAISE EXCEPTION 'Invalid subject type';
    END IF;

    -- Validate severity
    IF p_severity NOT IN ('low', 'medium', 'high') THEN
        RAISE EXCEPTION 'Invalid severity';
    END IF;

    -- Create report
    INSERT INTO reports (
        reporter_id,
        subject_type,
        subject_id,
        reason,
        details,
        severity,
        status
    ) VALUES (
        current_user,
        p_subject_type,
        p_subject_id,
        p_reason,
        p_details,
        p_severity,
        'open'
    ) RETURNING id INTO report_id;

    -- Log to audit
    INSERT INTO audit_log (actor_id, action, subject_type, subject_id, meta)
    VALUES (
        current_user,
        'report.created',
        'report',
        report_id,
        jsonb_build_object(
            'subject_type', p_subject_type,
            'subject_id', p_subject_id,
            'severity', p_severity
        )
    );

    RETURN report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PROFILE COMPLETENESS CALCULATION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_profile_completeness(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    p profiles%ROWTYPE;
BEGIN
    SELECT * INTO p FROM profiles WHERE id = user_id;

    -- Display name: 10 points
    IF p.display_name IS NOT NULL AND LENGTH(p.display_name) > 0 THEN
        score := score + 10;
    END IF;

    -- Bio: 20 points
    IF p.bio IS NOT NULL AND LENGTH(p.bio) >= 20 THEN
        score := score + 20;
    END IF;

    -- At least 1 photo: 20 points
    IF array_length(p.photos, 1) >= 1 THEN
        score := score + 20;
    END IF;

    -- At least 3 photos: additional 10 points
    IF array_length(p.photos, 1) >= 3 THEN
        score := score + 10;
    END IF;

    -- At least 3 interests: 20 points
    IF array_length(p.interests, 1) >= 3 THEN
        score := score + 20;
    END IF;

    -- Pronouns: 10 points
    IF p.pronouns IS NOT NULL THEN
        score := score + 10;
    END IF;

    -- Location: 10 points
    IF p.location_fuzzy_lat IS NOT NULL AND p.location_fuzzy_lng IS NOT NULL THEN
        score := score + 10;
    END IF;

    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Auto-update profile completeness on profile changes
CREATE OR REPLACE FUNCTION update_profile_completeness()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completeness := calculate_profile_completeness(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_completeness_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completeness();

-- ============================================================================
-- LOCATION FUZZING
-- ============================================================================

-- Fuzz location to ~2-3km radius
CREATE OR REPLACE FUNCTION fuzz_location(lat DECIMAL, lng DECIMAL)
RETURNS TABLE(fuzzy_lat DECIMAL, fuzzy_lng DECIMAL) AS $$
DECLARE
    -- Approximately 0.025 degrees ~ 2.5 km
    fuzz_amount DECIMAL := 0.025;
    random_angle DECIMAL;
    random_distance DECIMAL;
BEGIN
    -- Random angle in radians
    random_angle := random() * 2 * pi();
    -- Random distance within fuzz_amount
    random_distance := random() * fuzz_amount;

    fuzzy_lat := lat + (random_distance * sin(random_angle));
    fuzzy_lng := lng + (random_distance * cos(random_angle));

    RETURN QUERY SELECT fuzzy_lat, fuzzy_lng;
END;
$$ LANGUAGE plpgsql;
