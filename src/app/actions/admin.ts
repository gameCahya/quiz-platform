'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Admin function to fix orphaned auth users (users without profiles)
 * Can only be called by admin users
 */
export async function fixOrphanedUsers() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if current user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Admin only' }
  }

  // Find orphaned users (users in auth.users but not in profiles)
  const { data: allAuthUsers } = await supabase.auth.admin.listUsers()
  
  if (!allAuthUsers) {
    return { error: 'Failed to fetch users' }
  }

  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id')

  const profileIds = new Set(allProfiles?.map(p => p.id) || [])
  
  const orphanedUsers = allAuthUsers.users.filter(u => !profileIds.has(u.id))

  console.log('Found orphaned users:', orphanedUsers.length)

  // Create profiles for orphaned users
  const results = []
  for (const authUser of orphanedUsers) {
    const profileData = {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email || 'Unknown',
      role: authUser.user_metadata?.role || 'siswa',
    }

    const { error } = await supabase
      .from('profiles')
      .insert(profileData)

    results.push({
      email: authUser.email,
      success: !error,
      error: error?.message
    })
  }

  return {
    success: true,
    fixed: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    details: results
  }
}