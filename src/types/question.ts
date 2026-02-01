// ============================================
// QUESTION TYPES - Complete Type Definitions
// ============================================
// Support 8 question types with rich content

// --------------------------------------------
// Base Types
// --------------------------------------------

// Content block types (untuk rich content)
export type ContentBlock = 
  | { type: 'text'; content: string }
  | { type: 'math'; content: string } // LaTeX formula
  | { type: 'chemistry'; content: string } // Chemical formula
  | { type: 'image'; url: string; caption?: string }
  | { type: 'table'; data: string[][] }

// Question difficulty levels
export type QuestionDifficulty = 'easy' | 'medium' | 'hard'

// --------------------------------------------
// Question Type 1: Multiple Choice
// --------------------------------------------
export interface MultipleChoiceData {
  question: ContentBlock[]
  options: {
    id: string // 'A', 'B', 'C', 'D', 'E'
    content: ContentBlock[]
  }[]
  correctAnswer: string // 'A', 'B', 'C', 'D', or 'E'
  explanation?: ContentBlock[]
}

// --------------------------------------------
// Question Type 2: Multiple Response
// --------------------------------------------
export interface MultipleResponseData {
  question: ContentBlock[]
  options: {
    id: string
    content: ContentBlock[]
  }[]
  correctAnswers: string[] // Multiple correct answers: ['A', 'C', 'D']
  explanation?: ContentBlock[]
}

// --------------------------------------------
// Question Type 3: True/False
// --------------------------------------------
export interface TrueFalseData {
  question: ContentBlock[]
  correctAnswer: boolean
  explanation?: ContentBlock[]
}

// --------------------------------------------
// Question Type 4: Statement Validation
// --------------------------------------------
export interface StatementValidationData {
  question: ContentBlock[]
  statements: {
    id: string
    content: ContentBlock[]
    isTrue: boolean
  }[]
  explanation?: ContentBlock[]
}

// --------------------------------------------
// Question Type 5: Matching
// --------------------------------------------
export interface MatchingData {
  question: ContentBlock[]
  leftColumn: {
    id: string
    content: ContentBlock[]
  }[]
  rightColumn: {
    id: string
    content: ContentBlock[]
  }[]
  correctMatches: {
    leftId: string
    rightId: string
  }[]
  explanation?: ContentBlock[]
}

// --------------------------------------------
// Question Type 6: Short Answer
// --------------------------------------------
export interface ShortAnswerData {
  question: ContentBlock[]
  correctAnswers: string[] // Accept multiple correct answers
  caseSensitive?: boolean
  explanation?: ContentBlock[]
}

// --------------------------------------------
// Question Type 7: Essay
// --------------------------------------------
export interface EssayData {
  question: ContentBlock[]
  minWords?: number
  maxWords?: number
  rubric?: ContentBlock[] // Grading rubric
  sampleAnswer?: ContentBlock[]
}

// --------------------------------------------
// Question Type 8: Ordering
// --------------------------------------------
export interface OrderingData {
  question: ContentBlock[]
  items: {
    id: string
    content: ContentBlock[]
  }[]
  correctOrder: string[] // Array of IDs in correct order
  explanation?: ContentBlock[]
}

// --------------------------------------------
// Union Type for All Question Data
// --------------------------------------------
export type QuestionData =
  | { type: 'multiple_choice'; data: MultipleChoiceData }
  | { type: 'multiple_response'; data: MultipleResponseData }
  | { type: 'true_false'; data: TrueFalseData }
  | { type: 'statement_validation'; data: StatementValidationData }
  | { type: 'matching'; data: MatchingData }
  | { type: 'short_answer'; data: ShortAnswerData }
  | { type: 'essay'; data: EssayData }
  | { type: 'ordering'; data: OrderingData }

// --------------------------------------------
// Question Row (Database)
// --------------------------------------------
export interface QuestionRow {
  id: string
  tryout_id: string
  question_number: number
  question_type: QuestionData['type']
  question_data: QuestionData['data']
  score: number
  created_at: string
}

// --------------------------------------------
// Question Input (for Create/Update)
// --------------------------------------------
export interface CreateQuestionInput {
  tryout_id: string
  question_number: number
  question_type: QuestionData['type']
  question_data: QuestionData['data']
  score: number
}

export interface UpdateQuestionInput {
  question_number?: number
  question_type?: QuestionData['type']
  question_data?: QuestionData['data']
  score?: number
}

// --------------------------------------------
// Question with Tryout Info
// --------------------------------------------
export interface QuestionWithTryout extends QuestionRow {
  tryout: {
    id: string
    title: string
    creator_id: string
  } | null
}

// --------------------------------------------
// Validation Constants
// --------------------------------------------
export const QUESTION_TYPES = [
  'multiple_choice',
  'multiple_response',
  'true_false',
  'statement_validation',
  'matching',
  'short_answer',
  'essay',
  'ordering',
] as const

export const QUESTION_TYPE_LABELS: Record<QuestionData['type'], string> = {
  multiple_choice: 'Pilihan Ganda',
  multiple_response: 'Pilihan Ganda Kompleks',
  true_false: 'Benar/Salah',
  statement_validation: 'Validasi Pernyataan',
  matching: 'Menjodohkan',
  short_answer: 'Isian Singkat',
  essay: 'Essay',
  ordering: 'Urutan',
}

export const DEFAULT_QUESTION_SCORE = 10

export const MAX_OPTIONS = 5 // A, B, C, D, E
export const MIN_OPTIONS = 2

// --------------------------------------------
// Helper Types for Question Builder UI
// --------------------------------------------
export interface QuestionBuilderState {
  questionType: QuestionData['type']
  score: number
  difficulty: QuestionDifficulty
  tags: string[]
}

// For reordering questions
export interface QuestionOrder {
  id: string
  question_number: number
}