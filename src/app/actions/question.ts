'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  QuestionRow,
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionOrder,
} from '@/types/question'

// ============================================
// CREATE QUESTION
// ============================================

export async function createQuestion(input: CreateQuestionInput) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Verify user has permission to add questions to this tryout
    const { data: tryout } = await supabase
      .from('tryouts')
      .select('id, creator_id, school_id')
      .eq('id', input.tryout_id)
      .single()

    if (!tryout) {
      return { success: false, error: 'Tryout not found' }
    }

    // Permission check
    const isOwner = tryout.creator_id === profile.id
    const isAdmin = profile.role === 'admin'

    if (!isOwner && !isAdmin) {
      return { success: false, error: 'No permission to add questions to this tryout' }
    }

    // Create question
    const { data: question, error } = await supabase
      .from('questions')
      .insert({
        tryout_id: input.tryout_id,
        question_number: input.question_number,
        question_type: input.question_type,
        question_data: input.question_data as never, // Type assertion for JSONB
        score: input.score,
      })
      .select()
      .single()

    if (error) {
      console.error('Create question error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/admin/tryouts/${input.tryout_id}/questions`)
    revalidatePath(`/dashboard/guru/tryouts/${input.tryout_id}/questions`)

    return { success: true, data: question as QuestionRow }
  } catch (error) {
    console.error('Create question exception:', error)
    const message = error instanceof Error ? error.message : 'Failed to create question'
    return { success: false, error: message }
  }
}

// ============================================
// GET QUESTIONS BY TRYOUT
// ============================================

export async function getQuestionsByTryout(tryoutId: string) {
  try {
    const supabase = await createClient()

    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('tryout_id', tryoutId)
      .order('question_number', { ascending: true })

    if (error) {
      console.error('Get questions error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: questions as QuestionRow[] }
  } catch (error) {
    console.error('Get questions exception:', error)
    const message = error instanceof Error ? error.message : 'Failed to get questions'
    return { success: false, error: message }
  }
}

// ============================================
// GET QUESTION BY ID
// ============================================

export async function getQuestionById(questionId: string) {
  try {
    const supabase = await createClient()

    const { data: question, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (error) {
      console.error('Get question error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: question as QuestionRow }
  } catch (error) {
    console.error('Get question exception:', error)
    const message = error instanceof Error ? error.message : 'Failed to get question'
    return { success: false, error: message }
  }
}

// ============================================
// UPDATE QUESTION
// ============================================

export async function updateQuestion(questionId: string, input: UpdateQuestionInput) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Get question with tryout info
    const { data: question } = await supabase
      .from('questions')
      .select('id, tryout_id, tryouts(creator_id)')
      .eq('id', questionId)
      .single()

    if (!question) {
      return { success: false, error: 'Question not found' }
    }

    // Permission check
    const tryoutCreatorId = (question.tryouts as never as { creator_id: string })?.creator_id
    const isOwner = tryoutCreatorId === profile.id
    const isAdmin = profile.role === 'admin'

    if (!isOwner && !isAdmin) {
      return { success: false, error: 'No permission to update this question' }
    }

    // Update question
    const updateData: Record<string, unknown> = {}
    if (input.question_number !== undefined) updateData.question_number = input.question_number
    if (input.question_type !== undefined) updateData.question_type = input.question_type
    if (input.question_data !== undefined) updateData.question_data = input.question_data
    if (input.score !== undefined) updateData.score = input.score

    const { data: updatedQuestion, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', questionId)
      .select()
      .single()

    if (error) {
      console.error('Update question error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/admin/tryouts/${question.tryout_id}/questions`)
    revalidatePath(`/dashboard/guru/tryouts/${question.tryout_id}/questions`)

    return { success: true, data: updatedQuestion as QuestionRow }
  } catch (error) {
    console.error('Update question exception:', error)
    const message = error instanceof Error ? error.message : 'Failed to update question'
    return { success: false, error: message }
  }
}

// ============================================
// DELETE QUESTION
// ============================================

export async function deleteQuestion(questionId: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Get question with tryout info
    const { data: question } = await supabase
      .from('questions')
      .select('id, tryout_id, question_number, tryouts(creator_id)')
      .eq('id', questionId)
      .single()

    if (!question) {
      return { success: false, error: 'Question not found' }
    }

    // Permission check
    const tryoutCreatorId = (question.tryouts as never as { creator_id: string })?.creator_id
    const isOwner = tryoutCreatorId === profile.id
    const isAdmin = profile.role === 'admin'

    if (!isOwner && !isAdmin) {
      return { success: false, error: 'No permission to delete this question' }
    }

    const deletedQuestionNumber = question.question_number

    // Delete question
    const { error } = await supabase.from('questions').delete().eq('id', questionId)

    if (error) {
      console.error('Delete question error:', error)
      return { success: false, error: error.message }
    }

    // Reorder remaining questions (decrement numbers after deleted question)
    const { error: reorderError } = await supabase.rpc('reorder_questions_after_delete', {
      p_tryout_id: question.tryout_id,
      p_deleted_number: deletedQuestionNumber,
    })

    // If RPC doesn't exist, do it manually
    if (reorderError) {
      console.log('RPC not found, reordering manually...')
      
      // Get all questions after the deleted one
      const { data: questionsToReorder } = await supabase
        .from('questions')
        .select('id, question_number')
        .eq('tryout_id', question.tryout_id)
        .gt('question_number', deletedQuestionNumber)
        .order('question_number')

      // Update each question number
      if (questionsToReorder && questionsToReorder.length > 0) {
        for (const q of questionsToReorder) {
          await supabase
            .from('questions')
            .update({ question_number: q.question_number - 1 })
            .eq('id', q.id)
        }
      }
    }

    revalidatePath(`/dashboard/admin/tryouts/${question.tryout_id}/questions`)
    revalidatePath(`/dashboard/guru/tryouts/${question.tryout_id}/questions`)

    return { success: true }
  } catch (error) {
    console.error('Delete question exception:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete question'
    return { success: false, error: message }
  }
}

// ============================================
// REORDER QUESTIONS
// ============================================

export async function reorderQuestions(tryoutId: string, newOrder: QuestionOrder[]) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Verify permission
    const { data: tryout } = await supabase
      .from('tryouts')
      .select('id, creator_id')
      .eq('id', tryoutId)
      .single()

    if (!tryout) {
      return { success: false, error: 'Tryout not found' }
    }

    const isOwner = tryout.creator_id === profile.id
    const isAdmin = profile.role === 'admin'

    if (!isOwner && !isAdmin) {
      return { success: false, error: 'No permission to reorder questions' }
    }

    // Update question numbers
    for (const item of newOrder) {
      await supabase
        .from('questions')
        .update({ question_number: item.question_number })
        .eq('id', item.id)
    }

    revalidatePath(`/dashboard/admin/tryouts/${tryoutId}/questions`)
    revalidatePath(`/dashboard/guru/tryouts/${tryoutId}/questions`)

    return { success: true }
  } catch (error) {
    console.error('Reorder questions exception:', error)
    const message = error instanceof Error ? error.message : 'Failed to reorder questions'
    return { success: false, error: message }
  }
}

// ============================================
// DUPLICATE QUESTION
// ============================================

export async function duplicateQuestion(questionId: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get original question
    const { data: originalQuestion } = await supabase
      .from('questions')
      .select('*, tryouts(creator_id)')
      .eq('id', questionId)
      .single()

    if (!originalQuestion) {
      return { success: false, error: 'Question not found' }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Permission check
    const tryoutCreatorId = (originalQuestion.tryouts as never as { creator_id: string })?.creator_id
    const isOwner = tryoutCreatorId === profile.id
    const isAdmin = profile.role === 'admin'

    if (!isOwner && !isAdmin) {
      return { success: false, error: 'No permission to duplicate this question' }
    }

    // Get max question number
    const { data: maxQuestion } = await supabase
      .from('questions')
      .select('question_number')
      .eq('tryout_id', originalQuestion.tryout_id)
      .order('question_number', { ascending: false })
      .limit(1)
      .single()

    const newQuestionNumber = (maxQuestion?.question_number || 0) + 1

    // Create duplicate
    const { data: newQuestion, error } = await supabase
      .from('questions')
      .insert({
        tryout_id: originalQuestion.tryout_id,
        question_number: newQuestionNumber,
        question_type: originalQuestion.question_type,
        question_data: originalQuestion.question_data,
        score: originalQuestion.score,
      })
      .select()
      .single()

    if (error) {
      console.error('Duplicate question error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/admin/tryouts/${originalQuestion.tryout_id}/questions`)
    revalidatePath(`/dashboard/guru/tryouts/${originalQuestion.tryout_id}/questions`)

    return { success: true, data: newQuestion as QuestionRow }
  } catch (error) {
    console.error('Duplicate question exception:', error)
    const message = error instanceof Error ? error.message : 'Failed to duplicate question'
    return { success: false, error: message }
  }
}