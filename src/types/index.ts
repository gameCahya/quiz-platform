// ============================================
// TYPE DEFINITIONS FOR QUIZ PLATFORM
// ============================================
// File: src/types/index.ts

// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole = 'admin' | 'guru' | 'siswa'

export type Profile = {
  id: string
  email: string
  name: string
  role: UserRole
  school_id: string | null
  education_level_id: string | null
  class_id: string | null
  created_at: string
}

// With relations
export type ProfileWithRelations = Profile & {
  school: School | null
  education_level: EducationLevel | null
  class: Class | null
}

// ============================================
// SCHOOL & EDUCATION TYPES
// ============================================

export type School = {
  id: string
  name: string
  created_at: string
}

export type EducationLevel = {
  id: string
  name: string
  grades: number[] // e.g., [1, 2, 3, 4, 5, 6] for SD
  created_at: string
}

export type Class = {
  id: string
  name: string
  education_level_id: string
  created_at: string
}

export type ClassWithEducationLevel = Class & {
  education_level: EducationLevel
}

// ============================================
// TRYOUT TYPES
// ============================================

export type PricingModel = 'free' | 'freemium' | 'premium'

export type Tryout = {
  id: string
  title: string
  description: string | null
  creator_id: string
  school_id: string | null
  is_global: boolean
  
  // Pricing
  pricing_model: PricingModel
  tryout_price: number
  explanation_price: number
  has_explanation: boolean
  
  // Schedule
  duration_minutes: number
  start_time: string
  end_time: string
  
  created_at: string
}

// With relations
export type TryoutWithRelations = Tryout & {
  creator: {
    id: string
    name: string
    role: UserRole
  } | null
  school: School | null
  questions?: Question[]
  _count?: {
    questions: number
    submissions: number
  }
}

// For list display
export type TryoutListItem = {
  id: string
  title: string
  description: string | null
  pricing_model: PricingModel
  tryout_price: number
  explanation_price: number
  duration_minutes: number
  is_global: boolean
  creator: { name: string; role: string } | null
  school: { name: string } | null
  start_time: string
  end_time: string
  total_questions?: number
}

// ============================================
// QUESTION TYPES
// ============================================

export type QuestionType =
  | 'multiple_choice'
  | 'multiple_response'
  | 'true_false'
  | 'statement_validation'
  | 'matching'
  | 'short_answer'
  | 'essay'
  | 'ordering'

export type DifficultyLevel = 'easy' | 'medium' | 'hard'

// Content block types
export type ContentBlockType = 'text' | 'math' | 'chemistry' | 'image' | 'table'

export type ContentBlock = {
  type: ContentBlockType
  content: string
  url?: string // for images
  caption?: string // for images
}

// Base question structure
export type Question = {
  id: string
  tryout_id: string
  question_number: number
  question_type: QuestionType
  question_data: QuestionData
  score: number
  explanation: ExplanationData | null
  explanation_video_url: string | null
  created_at: string
}

// Question data (JSONB field)
export type QuestionData = {
  type: QuestionType
  question: ContentBlock[]
  difficulty?: DifficultyLevel
  tags?: string[]
} & QuestionTypeSpecificData

// Different data for each question type
export type QuestionTypeSpecificData =
  | MultipleChoiceData
  | MultipleResponseData
  | TrueFalseData
  | StatementValidationData
  | MatchingData
  | ShortAnswerData
  | EssayData
  | OrderingData

// ============================================
// SPECIFIC QUESTION TYPE DATA
// ============================================

// 1. Multiple Choice
export type MultipleChoiceData = {
  type: 'multiple_choice'
  options: {
    id: string // 'A', 'B', 'C', 'D'
    content: ContentBlock[]
  }[]
  correct_answer: string // 'A'
}

// 2. Multiple Response (pilih lebih dari 1)
export type MultipleResponseData = {
  type: 'multiple_response'
  options: {
    id: string
    content: ContentBlock[]
  }[]
  correct_answers: string[] // ['A', 'C']
}

// 3. True/False
export type TrueFalseData = {
  type: 'true_false'
  correct_answer: boolean
}

// 4. Statement Validation (beberapa pernyataan benar/salah)
export type StatementValidationData = {
  type: 'statement_validation'
  statements: {
    id: string
    content: ContentBlock[]
    correct_answer: boolean
  }[]
}

// 5. Matching (menjodohkan)
export type MatchingData = {
  type: 'matching'
  left_items: {
    id: string
    content: ContentBlock[]
  }[]
  right_items: {
    id: string
    content: ContentBlock[]
  }[]
  correct_matches: {
    left_id: string
    right_id: string
  }[]
}

// 6. Short Answer (isian singkat)
export type ShortAnswerData = {
  type: 'short_answer'
  correct_answer: string
  case_sensitive?: boolean
  accept_alternatives?: string[] // alternative answers
}

// 7. Essay (jawaban panjang - manual grading)
export type EssayData = {
  type: 'essay'
  max_words?: number
  grading_rubric?: string
}

// 8. Ordering (urutkan)
export type OrderingData = {
  type: 'ordering'
  items: {
    id: string
    content: ContentBlock[]
  }[]
  correct_order: string[] // array of ids in correct order
}

// ============================================
// EXPLANATION DATA
// ============================================

export type ExplanationData = {
  content: ContentBlock[]
  video_explanation?: {
    url: string
    duration: string
    thumbnail: string
  }
  difficulty_level?: string
  time_to_solve?: string
  common_mistakes?: string[]
  related_topics?: string[]
}

// ============================================
// SUBMISSION & ANSWER TYPES
// ============================================

export type Submission = {
  id: string
  user_id: string
  tryout_id: string
  answers: AnswerData
  total_score: number | null
  submitted_at: string
}

// Answers data (JSONB field)
export type AnswerData = {
  [question_id: string]: QuestionAnswer
}

export type QuestionAnswer = {
  question_id: string
  question_type: QuestionType
  answer: unknown // type depends on question type
  is_correct?: boolean
  score?: number
  time_spent?: number // in seconds
}

// Specific answer types
export type MultipleChoiceAnswer = {
  question_id: string
  question_type: 'multiple_choice'
  answer: string // 'A'
  is_correct: boolean
  score: number
}

export type MultipleResponseAnswer = {
  question_id: string
  question_type: 'multiple_response'
  answer: string[] // ['A', 'C']
  is_correct: boolean
  score: number
}

export type TrueFalseAnswer = {
  question_id: string
  question_type: 'true_false'
  answer: boolean
  is_correct: boolean
  score: number
}

export type StatementValidationAnswer = {
  question_id: string
  question_type: 'statement_validation'
  answer: {
    statement_id: string
    answer: boolean
  }[]
  is_correct: boolean
  score: number
}

export type MatchingAnswer = {
  question_id: string
  question_type: 'matching'
  answer: {
    left_id: string
    right_id: string
  }[]
  is_correct: boolean
  score: number
}

export type ShortAnswerAnswer = {
  question_id: string
  question_type: 'short_answer'
  answer: string
  is_correct: boolean
  score: number
}

export type EssayAnswer = {
  question_id: string
  question_type: 'essay'
  answer: string
  is_correct: boolean // manually graded
  score: number // manually graded
  feedback?: string
}

export type OrderingAnswer = {
  question_id: string
  question_type: 'ordering'
  answer: string[] // array of ids in user's order
  is_correct: boolean
  score: number
}

// ============================================
// SUBMISSION WITH DETAILS
// ============================================

export type SubmissionWithDetails = Submission & {
  user: {
    id: string
    name: string
    email: string
  }
  tryout: {
    id: string
    title: string
    duration_minutes: number
  }
  questions: Question[]
}

// ============================================
// PURCHASE TYPES
// ============================================

export type PurchaseType = 'tryout_access' | 'explanation_access' | 'bundle'

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'expired'

export type Purchase = {
  id: string
  user_id: string
  tryout_id: string
  purchase_type: PurchaseType
  
  // Payment
  payment_method: string | null
  amount_paid: number
  payment_status: PaymentStatus
  
  transaction_id: string
  payment_url: string | null
  payment_expired_at: string | null
  
  purchased_at: string
  paid_at: string | null
}

export type PurchaseWithTryout = Purchase & {
  tryout: {
    id: string
    title: string
    pricing_model: PricingModel
  }
}

// ============================================
// LEADERBOARD TYPES
// ============================================

export type LeaderboardEntry = {
  rank: number
  user_id: string
  user_name: string
  school_name?: string
  class_name?: string
  total_score: number
  submitted_at: string
}

export type TryoutLeaderboard = {
  tryout_id: string
  tryout_title: string
  entries: LeaderboardEntry[]
}

// ============================================
// FORM TYPES (for React Hook Form)
// ============================================

export type RegisterFormData = {
  email: string
  password: string
  confirmPassword: string
  name: string
  role: UserRole
  school_id?: string
  education_level_id?: string
  class_id?: string
}

export type LoginFormData = {
  email: string
  password: string
}

export type TryoutFormData = {
  title: string
  description?: string
  pricing_model: PricingModel
  tryout_price: number
  explanation_price: number
  has_explanation: boolean
  duration_minutes: number
  start_time: string
  end_time: string
  is_global: boolean
  school_id?: string
}

export type QuestionFormData = {
  question_number: number
  question_type: QuestionType
  question_data: QuestionData
  score: number
  explanation?: ExplanationData
  explanation_video_url?: string
}

// ============================================
// UTILITY TYPES
// ============================================

export type PaginationParams = {
  page: number
  limit: number
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type FilterParams = {
  search?: string
  school_id?: string
  education_level_id?: string
  class_id?: string
  pricing_model?: PricingModel
  is_global?: boolean
  creator_id?: string
}

export type SortParams = {
  field: string
  order: 'asc' | 'desc'
}

// ============================================
// API RESPONSE TYPES
// ============================================

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type ApiError = {
  code: string
  message: string
  details?: unknown
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

export type SelectOption = {
  value: string
  label: string
}

export type FilterOption = {
  id: string
  name: string
}

// ============================================
// EXPORT ALL
// ============================================

export type {
  // Re-export for convenience
  Profile as User,
  Tryout as TryoutType,
  Question as QuestionType,
  Submission as SubmissionType,
}