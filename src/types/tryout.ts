/**
 * Tryout Type Definitions
 * Complete types for tryout feature
 */

// ============================================
// ENUMS & CONSTANTS
// ============================================

export const PRICING_MODELS = {
  FREE: 'free',
  FREEMIUM: 'freemium',
  PREMIUM: 'premium',
} as const

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  MULTIPLE_RESPONSE: 'multiple_response',
  TRUE_FALSE: 'true_false',
  STATEMENT_VALIDATION: 'statement_validation',
  MATCHING: 'matching',
  SHORT_ANSWER: 'short_answer',
  ESSAY: 'essay',
  ORDERING: 'ordering',
} as const

export type PricingModel = (typeof PRICING_MODELS)[keyof typeof PRICING_MODELS]
export type QuestionType = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES]

// ============================================
// DATABASE TYPES (from Supabase)
// ============================================

/**
 * Tryout table row (from database)
 */
export type TryoutRow = {
  id: string
  title: string
  description: string | null
  creator_id: string
  school_id: string | null
  is_global: boolean
  pricing_model: PricingModel
  tryout_price: number
  explanation_price: number
  has_explanation: boolean
  duration_minutes: number | null
  start_time: string | null
  end_time: string | null
  created_at: string
}

/**
 * Question table row (from database)
 */
export type QuestionRow = {
  id: string
  tryout_id: string
  question_number: number
  question_type: QuestionType
  question_data: Record<string, unknown>
  score: number
  created_at: string
}

// ============================================
// API TYPES (for forms & components)
// ============================================

/**
 * Form data for creating new tryout
 */
export type CreateTryoutInput = {
  title: string
  description?: string
  school_id?: string | null
  is_global: boolean
  pricing_model: PricingModel
  tryout_price: number
  explanation_price: number
  has_explanation: boolean
  duration_minutes?: number | null
  start_time?: string | null
  end_time?: string | null
}

/**
 * Form data for updating tryout
 */

export type UpdateTryoutInput = {
  // NO id field here!
  title?: string
  description?: string
  pricing_model?: PricingModel
  tryout_price?: number
  explanation_price?: number
  has_explanation?: boolean
  is_global?: boolean
  school_id?: string
  duration_minutes?: number
  start_time?: string
  end_time?: string
}
/**
 * Tryout with creator info (for list views)
 */
export type TryoutWithCreator = TryoutRow & {
  creator: {
    id: string
    name: string
    email: string
    role: string
  } | null
  school: {
    id: string
    name: string
  } | null
  total_questions?: number
}

/**
 * Tryout with questions (for detail view)
 */
export type TryoutWithQuestions = TryoutRow & {
  questions: QuestionRow[]
  creator: {
    id: string
    name: string
    email: string
    role: string
  } | null
}

// ============================================
// QUESTION DATA TYPES
// ============================================

/**
 * Base question data structure
 */
export type BaseQuestionData = {
  question: QuestionContent[]
  explanation?: QuestionContent[]
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
}

/**
 * Content element types (text, math, image, etc)
 */
export type QuestionContent =
  | { type: 'text'; content: string }
  | { type: 'math'; content: string }
  | { type: 'chemistry'; content: string }
  | { type: 'image'; url: string; caption?: string }
  | { type: 'table'; data: string[][] }

/**
 * Multiple Choice question data
 */
export type MultipleChoiceData = BaseQuestionData & {
  options: {
    id: string
    content: QuestionContent[]
  }[]
  correct_answer: string
}

/**
 * Multiple Response question data
 */
export type MultipleResponseData = BaseQuestionData & {
  options: {
    id: string
    content: QuestionContent[]
  }[]
  correct_answers: string[]
}

/**
 * True/False question data
 */
export type TrueFalseData = BaseQuestionData & {
  correct_answer: boolean
}

/**
 * Statement Validation question data
 */
export type StatementValidationData = BaseQuestionData & {
  statements: {
    id: string
    content: QuestionContent[]
    correct_answer: boolean
  }[]
}

/**
 * Matching question data
 */
export type MatchingData = BaseQuestionData & {
  left_items: {
    id: string
    content: QuestionContent[]
  }[]
  right_items: {
    id: string
    content: QuestionContent[]
  }[]
  correct_pairs: {
    left_id: string
    right_id: string
  }[]
}

/**
 * Short Answer question data
 */
export type ShortAnswerData = BaseQuestionData & {
  correct_answers: string[]
  case_sensitive?: boolean
}

/**
 * Essay question data
 */
export type EssayData = BaseQuestionData & {
  min_words?: number
  max_words?: number
  rubric?: string
}

/**
 * Ordering question data
 */
export type OrderingData = BaseQuestionData & {
  items: {
    id: string
    content: QuestionContent[]
  }[]
  correct_order: string[]
}

/**
 * Union type for all question data
 */
export type QuestionData =
  | MultipleChoiceData
  | MultipleResponseData
  | TrueFalseData
  | StatementValidationData
  | MatchingData
  | ShortAnswerData
  | EssayData
  | OrderingData

// ============================================
// FILTER & SORT TYPES
// ============================================

/**
 * Filter options for tryout list
 */
export type TryoutFilters = {
  search?: string
  pricing_model?: PricingModel | 'all'
  is_global?: boolean
  school_id?: string
  creator_id?: string
  date_from?: string
  date_to?: string
}

/**
 * Sort options for tryout list
 */
export type TryoutSort = {
  field: 'created_at' | 'title' | 'start_time'
  direction: 'asc' | 'desc'
}

// ============================================
// STATS TYPES
// ============================================

/**
 * Tryout statistics
 */
export type TryoutStats = {
  total_attempts: number
  total_submissions: number
  avg_score: number
  completion_rate: number
}

// ============================================
// VALIDATION SCHEMAS (for reference)
// ============================================

/**
 * Validation rules for tryout creation
 */
export const TRYOUT_VALIDATION = {
  title: {
    min: 3,
    max: 200,
    required: true,
  },
  description: {
    max: 1000,
    required: false,
  },
  duration_minutes: {
    min: 1,
    max: 480, // 8 hours max
    required: false,
  },
  tryout_price: {
    min: 0,
    max: 10000000, // 10 juta max
  },
  explanation_price: {
    min: 0,
    max: 10000000,
  },
} as const

/**
 * Validation rules for question
 */
export const QUESTION_VALIDATION = {
  score: {
    min: 0,
    max: 100,
  },
  question_number: {
    min: 1,
  },
} as const