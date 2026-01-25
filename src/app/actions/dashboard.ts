'use server'

import { createClient } from '@/lib/supabase/server'
import type { 
  AdminDashboardStats, 
  GuruDashboardStats, 
  SiswaDashboardStats 
} from '@/types/dashboard'

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createClient()

  // Get counts
  const [
    { count: totalUsers },
    { count: totalSchools },
    { count: totalTryouts },
    { count: totalSubmissions }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('schools').select('*', { count: 'exact', head: true }),
    supabase.from('tryouts').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true })
  ])

  // Get recent tryouts
  const { data: recentTryouts } = await supabase
    .from('tryouts')
    .select(`
      id,
      title,
      created_at,
      creator:profiles!tryouts_creator_id_fkey(name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent submissions
  const { data: recentSubmissions } = await supabase
    .from('submissions')
    .select(`
      id,
      total_score,
      submitted_at,
      user:profiles!submissions_user_id_fkey(name),
      tryout:tryouts(title)
    `)
    .order('submitted_at', { ascending: false })
    .limit(5)

  return {
    totalUsers: totalUsers || 0,
    totalSchools: totalSchools || 0,
    totalTryouts: totalTryouts || 0,
    totalSubmissions: totalSubmissions || 0,
    recentTryouts: recentTryouts || [],
    recentSubmissions: recentSubmissions || []
  }
}

export async function getGuruDashboardStats(): Promise<GuruDashboardStats> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Get guru profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) {
    throw new Error('School not found')
  }

  // Get counts for guru's school
  const [
    { count: totalStudents },
    { count: totalTryouts },
    { count: totalSubmissions }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', profile.school_id)
      .eq('role', 'siswa'),
    supabase
      .from('tryouts')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', user.id),
    supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .in('tryout_id', 
        supabase
          .from('tryouts')
          .select('id')
          .eq('creator_id', user.id)
      )
  ])

  // Get my tryouts
  const { data: myTryouts } = await supabase
    .from('tryouts')
    .select('id, title, created_at')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    totalStudents: totalStudents || 0,
    totalTryouts: totalTryouts || 0,
    totalSubmissions: totalSubmissions || 0,
    myTryouts: myTryouts || []
  }
}

export async function getSiswaDashboardStats(): Promise<SiswaDashboardStats> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Get available tryouts count
  const { count: availableTryouts } = await supabase
    .from('tryouts')
    .select('*', { count: 'exact', head: true })
    .or('is_global.eq.true,school_id.eq.' + user.user_metadata.school_id)

  // Get my submissions count
  const { count: completedTryouts } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get my recent submissions
  const { data: recentSubmissions } = await supabase
    .from('submissions')
    .select(`
      id,
      total_score,
      submitted_at,
      tryout:tryouts(title)
    `)
    .eq('user_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(5)

  // Get my rank (simplified - needs proper leaderboard logic)
  const { count: betterScores } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .gt('total_score', recentSubmissions?.[0]?.total_score || 0)

  return {
    availableTryouts: availableTryouts || 0,
    completedTryouts: completedTryouts || 0,
    averageScore: 0, // Calculate later
    rank: (betterScores || 0) + 1,
    recentSubmissions: recentSubmissions || []
  }
}
