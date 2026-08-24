import { supabase } from './supabaseClient';

/**
 * Update user profile with email (called after successful signup)
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} fullName - User full name
 * @returns {Promise<Object>} Updated profile
 */
export async function updateUserEmailInProfile(userId, email, fullName) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: email,
          full_name: fullName,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user email in profile:', error);
    // Don't throw - this is not critical
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: get trip count for a single user_id
// ─────────────────────────────────────────────────────────────────────────────
async function getTripCount(userId) {
  try {
    const result = await supabase
      .from('trips')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    // result.count is the integer count when head:true is used
    return typeof result.count === 'number' ? result.count : 0;
  } catch {
    return 0;
  }
}

/**
 * Fetch all registered users from the database with trip counts.
 *
 * Strategy:
 *  1. RPC `get_all_users_admin` (SECURITY DEFINER) — reads auth.users directly,
 *     so email is always available. Run supabase/admin_users_rpc.sql once.
 *  2. profiles table — fallback using email stored at signup.
 *     NOTE: the default RLS policy (profiles_select_own) only lets users read
 *     their own row, so this path only works if you've added an admin-select
 *     policy or the email backfill from admin_users_rpc.sql has run.
 *
 * @returns {Promise<Array>}
 */
export async function getAllUsers() {
  try {
    // ── 1. RPC path ───────────────────────────────────────────────────────────
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_users_admin');

    if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
      const enriched = await Promise.all(
        rpcData.map(async (u) => {
          const meta = u.raw_user_meta_data || {};
          const tripsCount = await getTripCount(u.id);
          return {
            id: u.id,
            email: u.email || meta.email || 'N/A',
            full_name:
              u.full_name || meta.full_name || meta.name || 'Not provided',
            role: u.role || 'user',
            created_at: u.created_at,
            total_trips: tripsCount,
          };
        })
      );
      return enriched;
    }

    if (rpcError) {
      console.warn(
        '[getAllUsers] get_all_users_admin RPC failed — falling back to profiles table.',
        '\nRun supabase/admin_users_rpc.sql in your Supabase SQL Editor to fix this.',
        '\nRPC error:', rpcError.message
      );
    }

    // ── 2. profiles table fallback ────────────────────────────────────────────
    // Try with email column first; if that column doesn't exist, try without.
    let profiles = [];

    const { data: withEmail, error: withEmailErr } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (!withEmailErr && Array.isArray(withEmail)) {
      profiles = withEmail;
    } else {
      const { data: withoutEmail, error: withoutEmailErr } = await supabase
        .from('profiles')
        .select('id, full_name, role, created_at')
        .order('created_at', { ascending: false });

      if (withoutEmailErr) {
        throw new Error(
          'Unable to fetch user list. Please check database permissions or run supabase/admin_users_rpc.sql.'
        );
      }
      profiles = withoutEmail || [];
    }

    if (!profiles.length) return [];

    const usersWithTrips = await Promise.all(
      profiles.map(async (profile) => {
        const tripsCount = await getTripCount(profile.id);
        return {
          id: profile.id,
          email: profile.email || 'N/A',
          full_name: profile.full_name || 'Not provided',
          role: profile.role || 'user',
          created_at: profile.created_at,
          total_trips: tripsCount,
        };
      })
    );

    return usersWithTrips;
  } catch (error) {
    console.error('[getAllUsers] Error:', error);
    throw new Error(
      error.message ||
        'Failed to fetch users. Please ensure you have the necessary permissions.'
    );
  }
}

/**
 * Fetch users with their auth metadata (email, created_at from auth table)
 * Requires admin privileges or specific RLS policy
 * @returns {Promise<Array>} List of users with detailed information
 */
export async function getUsersWithAuthData() {
  try {
    // Try RPC method first
    const { data, error } = await supabase.rpc('get_users_with_auth_data');
    
    if (error) throw error;
    if (data && data.length > 0) {
      return data;
    }

    // Fallback to getAllUsers if RPC fails
    return getAllUsers();
  } catch (error) {
    console.error('Error fetching users with auth data:', error);
    return getAllUsers().catch(() => []);
  }
}

/**
 * Get count of registered users
 * @returns {Promise<number>} Total number of users
 */
export async function getUserCount() {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting user count:', error);
    return 0;
  }
}

/**
 * Update user role (admin only)
 * @param {string} userId - User ID
 * @param {string} role - New role ('admin' or 'user')
 * @returns {Promise<Object>} Updated user profile
 */
export async function updateUserRole(userId, role) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role. Check permissions.');
  }
}
