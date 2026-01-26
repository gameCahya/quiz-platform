'use server'

import { createClient } from '@/lib/supabase/server'
import type { 
  AdminDashboardStats, 
  GuruDashboardStats, 
  SiswaDashboardStats,
  AdminRecentTryout,
  AdminRecentSubmission,
  SiswaRecentSubmission,
  MyTryout
} from '@/types/dashboard'

// Type for raw Supabase response (before transformation)
type SupabaseTryoutResponse = {
  id: string
  title: string
  description: string | null
  duration_minutes: number | null
  pricing_model: string | null
  tryout_price: number | null
  explanation_price: number | null
  start_time: string | null
  end_time: string | null
  created_at: string
  creator: Array<{
    name: string
    role: string
  }>
}

type SupabaseSubmissionResponse = {
  id: string
  total_score: number | null
  submitted_at: string
  user?: Array<{
    name: string
  }>
  tryout: Array<{
    title: string
  }>
}

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
  const { data: recentTryoutsRaw } = await supabase
    .from('tryouts')
    .select(`
      id,
      title,
      description,
      duration_minutes,
      pricing_model,
      tryout_price,
      explanation_price,
      start_time,
      end_time,
      created_at,
      creator:profiles!tryouts_creator_id_fkey(name, role)
    `)
    .order('created_at', { ascending: false })
    .limit(5)
    .returns<SupabaseTryoutResponse[]>()

  // Transform: array creator to object
  const recentTryouts: AdminRecentTryout[] = (recentTryoutsRaw || []).map((tryout) => ({
    id: tryout.id,
    title: tryout.title,
    description: tryout.description,
    duration_minutes: tryout.duration_minutes,
    pricing_model: tryout.pricing_model,
    tryout_price: tryout.tryout_price,
    explanation_price: tryout.explanation_price,
    start_time: tryout.start_time,
    end_time: tryout.end_time,
    created_at: tryout.created_at,
    creator: tryout.creator?.[0] || null
  }))

  // Get recent submissions
  const { data: recentSubmissionsRaw } = await supabase
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
    .returns<SupabaseSubmissionResponse[]>()

  // Transform: array relations to objects
  const recentSubmissions: AdminRecentSubmission[] = (recentSubmissionsRaw || []).map((sub) => ({
    id: sub.id,
    total_score: sub.total_score,
    submitted_at: sub.submitted_at,
    user: sub.user?.[0] || null,
    tryout: sub.tryout?.[0] || null
  }))

  return {
    totalUsers: totalUsers || 0,
    totalSchools: totalSchools || 0,
    totalTryouts: totalTryouts || 0,
    totalSubmissions: totalSubmissions || 0,
    recentTryouts,
    recentSubmissions
  }
}

export async function getGuruDashboardStats(): Promise<GuruDashboardStats> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) {
    throw new Error('School not found')
  }

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
  ])

  const { data: myTryouts } = await supabase
    .from('tryouts')
    .select('id, title, created_at')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)
    .returns<MyTryout[]>()

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  const { count: availableTryouts } = await supabase
    .from('tryouts')
    .select('*', { count: 'exact', head: true })
    .or(`is_global.eq.true,school_id.eq.${profile?.school_id || 'null'}`)

  const { count: completedTryouts } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Define type for raw response
  type RawSubmission = {
    id: string
    total_score: number | null
    submitted_at: string
    tryout: Array<{
      title: string
    }>
  }

  const { data: recentSubmissionsRaw } = await supabase
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
    .returns<RawSubmission[]>()

  // Transform to match type
  const recentSubmissions: SiswaRecentSubmission[] = (recentSubmissionsRaw || []).map((sub) => ({
    id: sub.id,
    total_score: sub.total_score,
    submitted_at: sub.submitted_at,
    tryout: sub.tryout?.[0] || null
  }))

  const averageScore = recentSubmissions.length > 0
    ? recentSubmissions.reduce((sum, s) => sum + (s.total_score || 0), 0) / recentSubmissions.length
    : 0

  const { count: betterScores } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .gt('total_score', recentSubmissions?.[0]?.total_score || 0)

  return {
    availableTryouts: availableTryouts || 0,
    completedTryouts: completedTryouts || 0,
    averageScore: Math.round(averageScore),
    rank: (betterScores || 0) + 1,
    recentSubmissions
  }
}

export async function getRecentTryouts() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  let query = supabase
    .from('tryouts')
    .select(`
      id,
      title,
      description,
      duration_minutes,
      pricing_model,
      tryout_price,
      explanation_price,
      start_time,
      end_time,
      created_at,
      creator:profiles!tryouts_creator_id_fkey(name, role)
    `)
    .order('created_at', { ascending: false })

  if (profile?.role === 'siswa') {
    query = query.or(`is_global.eq.true,school_id.eq.${profile.school_id || 'null'}`)
  } else if (profile?.role === 'guru') {
    query = query.or(`creator_id.eq.${user.id},is_global.eq.true`)
  }

  const { data: tryoutsRaw, error } = await query
    .limit(10)
    .returns<SupabaseTryoutResponse[]>()

  if (error) {
    console.error('Error fetching tryouts:', error)
    return []
  }

  // Transform creator from array to object
  const tryouts = (tryoutsRaw || []).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    duration_minutes: t.duration_minutes,
    pricing_model: t.pricing_model,
    tryout_price: t.tryout_price,
    explanation_price: t.explanation_price,
    start_time: t.start_time,
    end_time: t.end_time,
    created_at: t.created_at,
    creator: t.creator?.[0] || null
  }))

  return tryouts
}