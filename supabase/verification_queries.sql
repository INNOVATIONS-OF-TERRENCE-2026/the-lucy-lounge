-- THE LUCY LOUNGE - Production Verification Queries
-- Run these after migration to verify system health
-- Generated: 2024-01-24

-- ============================================
-- SECTION 1: DATA COUNTS
-- ============================================

-- 1.1 User counts
SELECT 
    'auth.users' as table_name,
    COUNT(*) as row_count
FROM auth.users
UNION ALL
SELECT 
    'profiles' as table_name,
    COUNT(*) as row_count
FROM profiles
UNION ALL
SELECT 
    'user_preferences' as table_name,
    COUNT(*) as row_count
FROM user_preferences
UNION ALL
SELECT 
    'user_sessions' as table_name,
    COUNT(*) as row_count
FROM user_sessions;

-- 1.2 Content counts
SELECT 
    'rooms' as table_name,
    COUNT(*) as row_count
FROM rooms
UNION ALL
SELECT 
    'messages' as table_name,
    COUNT(*) as row_count
FROM messages
UNION ALL
SELECT 
    'favorites' as table_name,
    COUNT(*) as row_count
FROM favorites
UNION ALL
SELECT 
    'memory_items' as table_name,
    COUNT(*) as row_count
FROM memory_items;

-- 1.3 Listening mode counts
SELECT 
    'spotify_connections' as table_name,
    COUNT(*) as row_count
FROM spotify_connections
UNION ALL
SELECT 
    'recently_played' as table_name,
    COUNT(*) as row_count
FROM recently_played;

-- 1.4 Legacy import counts
SELECT 
    'legacy_import_log' as table_name,
    COUNT(*) as row_count
FROM legacy_import_log;

-- ============================================
-- SECTION 2: INTEGRITY CHECKS
-- ============================================

-- 2.1 Users without profiles (should be 0)
SELECT 
    'users_without_profiles' as check_name,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- 2.2 Orphaned profiles (profiles without auth users - should be 0)
SELECT 
    'orphaned_profiles' as check_name,
    COUNT(*) as count
FROM profiles p
LEFT JOIN auth.users au ON au.id = p.id
WHERE au.id IS NULL;

-- 2.3 Orphaned messages (no user or room)
SELECT 
    'orphaned_messages' as check_name,
    COUNT(*) as count
FROM messages m
LEFT JOIN auth.users au ON au.id = m.user_id
WHERE m.user_id IS NOT NULL AND au.id IS NULL;

-- 2.4 Orphaned favorites
SELECT 
    'orphaned_favorites' as check_name,
    COUNT(*) as count
FROM favorites f
LEFT JOIN auth.users au ON au.id = f.user_id
WHERE au.id IS NULL;

-- 2.5 Orphaned spotify connections
SELECT 
    'orphaned_spotify_connections' as check_name,
    COUNT(*) as count
FROM spotify_connections sc
LEFT JOIN auth.users au ON au.id = sc.user_id
WHERE au.id IS NULL;

-- ============================================
-- SECTION 3: RLS VERIFICATION
-- ============================================

-- 3.1 Tables with RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3.2 Policies per table
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- SECTION 4: FUNCTION VERIFICATION
-- ============================================

-- 4.1 Check critical functions exist
SELECT 
    routine_name,
    routine_type,
    specific_schema
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'ensure_user_profile',
    'ensure_user_preferences',
    'upsert_spotify_connection',
    'disconnect_spotify',
    'find_orphaned_records',
    'is_admin',
    'handle_new_user'
)
ORDER BY routine_name;

-- ============================================
-- SECTION 5: INDEX VERIFICATION
-- ============================================

-- 5.1 Critical indexes
SELECT 
    indexname,
    tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND (
    indexname LIKE '%user_id%' OR
    indexname LIKE '%created_at%' OR
    indexname LIKE '%status%'
)
ORDER BY tablename, indexname;

-- ============================================
-- SECTION 6: TRIGGER VERIFICATION
-- ============================================

-- 6.1 Active triggers
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- SECTION 7: RECENT ACTIVITY
-- ============================================

-- 7.1 Recent users (last 24 hours)
SELECT 
    COUNT(*) as recent_users_24h
FROM auth.users
WHERE created_at > NOW() - INTERVAL '24 hours';

-- 7.2 Recent messages (last 24 hours)
SELECT 
    COUNT(*) as recent_messages_24h
FROM messages
WHERE created_at > NOW() - INTERVAL '24 hours';

-- 7.3 Recent sessions (last 24 hours)
SELECT 
    COUNT(*) as recent_sessions_24h
FROM user_sessions
WHERE created_at > NOW() - INTERVAL '24 hours';

-- ============================================
-- SECTION 8: SPOTIFY OAUTH STATUS
-- ============================================

-- 8.1 Spotify connection states
SELECT 
    CASE 
        WHEN expires_at > NOW() THEN 'active'
        ELSE 'expired'
    END as status,
    COUNT(*) as count
FROM spotify_connections
WHERE access_token IS NOT NULL
GROUP BY CASE 
    WHEN expires_at > NOW() THEN 'active'
    ELSE 'expired'
END;

-- ============================================
-- SECTION 9: LEGACY IMPORT STATUS
-- ============================================

-- 9.1 Import status summary
SELECT 
    status,
    COUNT(*) as count,
    MAX(created_at) as last_import
FROM legacy_import_log
GROUP BY status;

-- ============================================
-- SECTION 10: CLEANUP QUERIES (NON-DESTRUCTIVE)
-- ============================================

-- 10.1 Preview orphaned records (run find_orphaned_records() RPC instead)
-- SELECT * FROM find_orphaned_records();

-- 10.2 Preview expired sessions (older than 30 days)
SELECT 
    'expired_sessions' as cleanup_type,
    COUNT(*) as count
FROM user_sessions
WHERE last_active_at < NOW() - INTERVAL '30 days';

-- 10.3 Preview old messages (older than 1 year, if cleanup desired)
SELECT 
    'old_messages' as cleanup_type,
    COUNT(*) as count
FROM messages
WHERE created_at < NOW() - INTERVAL '1 year';

-- ============================================
-- VERIFICATION SUMMARY QUERY
-- ============================================

SELECT 
    'VERIFICATION COMPLETE' as status,
    NOW() as verified_at,
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM profiles) as total_profiles,
    (SELECT COUNT(*) FROM messages) as total_messages,
    (SELECT COUNT(*) FROM spotify_connections) as spotify_connections,
    (
        SELECT COUNT(*) 
        FROM auth.users au
        LEFT JOIN profiles p ON p.id = au.id
        WHERE p.id IS NULL
    ) as users_without_profiles,
    (
        SELECT COUNT(*) 
        FROM pg_tables 
        WHERE schemaname = 'public' AND rowsecurity = true
    ) as tables_with_rls;
