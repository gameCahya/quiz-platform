'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  CreateTryoutInput,
  UpdateTryoutInput,
  TryoutWithCreator,
  TryoutWithQuestions,
  TryoutFilters,
  TryoutSort,
} from '@/types/tryout'

/**
 * Generate unique tryout ID
 */
function generateTryoutId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `tryout-${timestamp}-${random}`
}

// ============================================
// CREATE
// ============================================

/**
 * Create new tryout
 */
export async function createTryout(input: CreateTryoutInput) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, school_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return {
        success: false,
        error: 'Profile not found',
      }
    }

    // Validate permissions
    if (profile.role === 'siswa') {
      return {
        success: false,
        error: 'Students cannot create tryouts',
      }
    }

    // For guru: must set school_id and cannot be global
    if (profile.role === 'guru') {
      input.is_global = false
      input.school_id = profile.school_id
    }

    // Generate tryout ID
    const tryoutId = generateTryoutId()

    // Insert tryout
    const { data: tryout, error } = await supabase
      .from('tryouts')
      .insert({
        id: tryoutId,
        title: input.title,
        description: input.description || null,
        creator_id: user.id,
        school_id: input.school_id || null,
        is_global: input.is_global,
        pricing_model: input.pricing_model,
        tryout_price: input.tryout_price,
        explanation_price: input.explanation_price,
        has_explanation: input.has_explanation,
        duration_minutes: input.duration_minutes || null,
        start_time: input.start_time || null,
        end_time: input.end_time || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Create tryout error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Revalidate tryout list pages
    revalidatePath('/dashboard/admin/tryouts')
    revalidatePath('/dashboard/guru/tryouts')

    return {
      success: true,
      data: tryout,
    }
  } catch (error) {
    console.error('Create tryout exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// READ
// ============================================

/**
 * Get all tryouts with filters and sorting
 */
export async function getTryouts(filters?: TryoutFilters, sort?: TryoutSort) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, school_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return {
        success: false,
        error: 'Profile not found',
      }
    }

    // Build query
    let query = supabase
      .from('tryouts')
      .select(
        `
        *,
        creator:profiles!creator_id (
          id,
          name,
          email,
          role
        ),
        school:schools!school_id (
          id,
          name
        )
      `
      )

    // Apply role-based filters
    if (profile.role === 'guru') {
      // Guru can only see their own tryouts
      query = query.eq('creator_id', profile.id)
    } else if (profile.role === 'siswa') {
      // Siswa can see global tryouts and school-level tryouts
      query = query.or(`is_global.eq.true,school_id.eq.${profile.school_id}`)
    }
    // Admin can see all tryouts (no filter)

    // Apply search filter
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }

    // Apply pricing model filter
    if (filters?.pricing_model && filters.pricing_model !== 'all') {
      query = query.eq('pricing_model', filters.pricing_model)
    }

    // Apply global filter
    if (filters?.is_global !== undefined) {
      query = query.eq('is_global', filters.is_global)
    }

    // Apply school filter (admin only)
    if (filters?.school_id && profile.role === 'admin') {
      query = query.eq('school_id', filters.school_id)
    }

    // Apply creator filter (admin only)
    if (filters?.creator_id && profile.role === 'admin') {
      query = query.eq('creator_id', filters.creator_id)
    }

    // Apply date filters
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    // Apply sorting
    const sortField = sort?.field || 'created_at'
    const sortDirection = sort?.direction || 'desc'
    query = query.order(sortField, { ascending: sortDirection === 'asc' })

    // Execute query
    const { data: tryoutsRaw, error } = await query

    if (error) {
      console.error('Get tryouts error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Transform array responses to objects
    const tryouts: TryoutWithCreator[] = (tryoutsRaw || []).map((t) => ({
      ...t,
      creator: Array.isArray(t.creator) ? t.creator[0] || null : t.creator,
      school: Array.isArray(t.school) ? t.school[0] || null : t.school,
    }))

    return {
      success: true,
      data: tryouts,
    }
  } catch (error) {
    console.error('Get tryouts exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get single tryout by ID with questions
 */
export async function getTryoutById(id: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Get tryout with creator and questions
    const { data: tryoutRaw, error } = await supabase
      .from('tryouts')
      .select(
        `
        *,
        creator:profiles!creator_id (
          id,
          name,
          email,
          role
        ),
        questions (
          *
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      console.error('Get tryout by ID error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Transform response
    const tryout: TryoutWithQuestions = {
      ...tryoutRaw,
      creator: Array.isArray(tryoutRaw.creator)
        ? tryoutRaw.creator[0] || null
        : tryoutRaw.creator,
      questions: tryoutRaw.questions || [],
    }

    return {
      success: true,
      data: tryout,
    }
  } catch (error) {
    console.error('Get tryout by ID exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// UPDATE
// ============================================

/**
 * Update tryout
 */
export async function updateTryout(input: UpdateTryoutInput) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return {
        success: false,
        error: 'Profile not found',
      }
    }

    // Check if tryout exists and user has permission
    const { data: existingTryout } = await supabase
      .from('tryouts')
      .select('id, creator_id')
      .eq('id', input.id)
      .single()

    if (!existingTryout) {
      return {
        success: false,
        error: 'Tryout not found',
      }
    }

    // Check permissions
    if (profile.role === 'guru' && existingTryout.creator_id !== user.id) {
      return {
        success: false,
        error: 'You can only edit your own tryouts',
      }
    }

    // Update tryout
    const { id, ...updateData } = input
    const { data: tryout, error } = await supabase
      .from('tryouts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update tryout error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Revalidate pages
    revalidatePath('/dashboard/admin/tryouts')
    revalidatePath('/dashboard/guru/tryouts')
    revalidatePath(`/dashboard/admin/tryouts/${id}`)
    revalidatePath(`/dashboard/guru/tryouts/${id}`)

    return {
      success: true,
      data: tryout,
    }
  } catch (error) {
    console.error('Update tryout exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// DELETE
// ============================================

/**
 * Delete tryout
 */
export async function deleteTryout(id: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return {
        success: false,
        error: 'Profile not found',
      }
    }

    // Check if tryout exists and user has permission
    const { data: existingTryout } = await supabase
      .from('tryouts')
      .select('id, creator_id')
      .eq('id', id)
      .single()

    if (!existingTryout) {
      return {
        success: false,
        error: 'Tryout not found',
      }
    }

    // Check permissions
    if (profile.role === 'guru' && existingTryout.creator_id !== user.id) {
      return {
        success: false,
        error: 'You can only delete your own tryouts',
      }
    }

    // Delete tryout (questions will be deleted via CASCADE)
    const { error } = await supabase.from('tryouts').delete().eq('id', id)

    if (error) {
      console.error('Delete tryout error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Revalidate pages
    revalidatePath('/dashboard/admin/tryouts')
    revalidatePath('/dashboard/guru/tryouts')

    return {
      success: true,
      message: 'Tryout deleted successfully',
    }
  } catch (error) {
    console.error('Delete tryout exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// DUPLICATE
// ============================================

/**
 * Duplicate tryout (copy with all questions)
 */
export async function duplicateTryout(id: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Get original tryout with questions
    const result = await getTryoutById(id)

    if (!result.success || !result.data) {
      return {
        success: false,
        error: 'Tryout not found',
      }
    }

    const original = result.data

    // Create new tryout (copy of original)
    const newTryoutId = generateTryoutId()

    const { data: newTryout, error: tryoutError } = await supabase
      .from('tryouts')
      .insert({
        id: newTryoutId,
        title: `${original.title} (Copy)`,
        description: original.description,
        creator_id: user.id,
        school_id: original.school_id,
        is_global: original.is_global,
        pricing_model: original.pricing_model,
        tryout_price: original.tryout_price,
        explanation_price: original.explanation_price,
        has_explanation: original.has_explanation,
        duration_minutes: original.duration_minutes,
        start_time: null, // Reset dates
        end_time: null,
      })
      .select()
      .single()

    if (tryoutError) {
      console.error('Duplicate tryout error:', tryoutError)
      return {
        success: false,
        error: tryoutError.message,
      }
    }

    // Copy questions if any
    if (original.questions && original.questions.length > 0) {
      const questionsToInsert = original.questions.map((q) => ({
        tryout_id: newTryoutId,
        question_number: q.question_number,
        question_type: q.question_type,
        question_data: q.question_data,
        score: q.score,
      }))

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (questionsError) {
        console.error('Duplicate questions error:', questionsError)
        // Continue anyway, tryout is created
      }
    }

    // Revalidate pages
    revalidatePath('/dashboard/admin/tryouts')
    revalidatePath('/dashboard/guru/tryouts')

    return {
      success: true,
      data: newTryout,
      message: 'Tryout duplicated successfully',
    }
  } catch (error) {
    console.error('Duplicate tryout exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}