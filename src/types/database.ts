// Database types
export type Profile = {
  id: string
  email: string
  name: string
  role: 'admin' | 'guru' | 'siswa'
  school_id: string | null
  education_level_id: string | null
  class_id: string | null
  phone: string | null
  student_number: string | null
  avatar_url: string | null
  created_at: string
}

export type ProfileInsert = Omit<Profile, 'created_at' | 'phone' | 'student_number' | 'avatar_url'>

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'email' | 'created_at'>>

export type School = {
  id: string
  name: string
  education_level_id: string | null
  address: string | null
  created_at: string
}

export type EducationLevel = {
  id: string
  name: string
  grades: number[] // Array of grade numbers, e.g., [1,2,3,4,5,6] for SD
  created_at: string
}

export type Class = {
  id: string
  name: string
  education_level_id: string
  created_at: string
}

export type Subject = {
  id: string
  name: string
  education_level_id: string
  created_at: string
}

// Tryout types
export type Tryout = {
  id: string
  title: string
  description: string | null
  creator_id: string
  school_id: string | null
  subject_id: string | null
  education_level_id: string | null
  class_id: string | null
  is_global: boolean
  is_published: boolean
  duration_minutes: number | null
  pricing_model: 'free' | 'freemium' | 'premium' | null
  tryout_price: number | null
  explanation_price: number | null
  start_time: string | null
  end_time: string | null
  created_at: string
  updated_at: string
}

// Question types
export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'multiple_response'
  | 'short_answer'
  | 'essay'
  | 'matching'
  | 'ordering'

export type QuestionDifficulty = 'easy' | 'medium' | 'hard'

// Multiple Choice Question Data
export type MultipleChoiceData = {
  question_text: string
  options: Array<{
    id: string // A, B, C, D
    text: string
  }>
  images?: string[]
}

export type MultipleChoiceAnswer = {
  selected: string // A, B, C, or D
}

// True/False Question Data
export type TrueFalseData = {
  question_text: string
  images?: string[]
}

export type TrueFalseAnswer = {
  selected: boolean
}

// Multiple Response Question Data
export type MultipleResponseData = {
  question_text: string
  options: Array<{
    id: string
    text: string
  }>
  images?: string[]
}

export type MultipleResponseAnswer = {
  selected: string[] // Array of option IDs
}

// Short Answer Question Data
export type ShortAnswerData = {
  question_text: string
  case_sensitive?: boolean
  images?: string[]
}

export type ShortAnswerAnswer = {
  text: string
}

// Essay Question Data
export type EssayData = {
  question_text: string
  max_words?: number
  images?: string[]
}

export type EssayAnswer = {
  text: string
}

// Union type for all question data types
export type QuestionData =
  | MultipleChoiceData
  | TrueFalseData
  | MultipleResponseData
  | ShortAnswerData
  | EssayData

// Union type for all answer types
export type QuestionAnswer =
  | MultipleChoiceAnswer
  | TrueFalseAnswer
  | MultipleResponseAnswer
  | ShortAnswerAnswer
  | EssayAnswer

export type Question = {
  id: string
  tryout_id: string
  question_number: number
  question_type: QuestionType
  question_data: QuestionData
  correct_answer: QuestionAnswer
  score: number
  explanation: string | null
  difficulty: QuestionDifficulty | null
  created_at: string
}

export type Submission = {
  id: string
  user_id: string
  tryout_id: string
  answers: Record<string, QuestionAnswer> // question_id -> answer
  total_score: number | null
  submitted_at: string
}

// Joined types for queries with relations
export type TryoutWithRelations = Tryout & {
  creator?: Pick<Profile, 'id' | 'name' | 'role'> | null
  school?: Pick<School, 'id' | 'name'> | null
  subject?: Pick<Subject, 'id' | 'name'> | null
  education_level?: Pick<EducationLevel, 'id' | 'name'> | null
  class?: Pick<Class, 'id' | 'name'> | null
}

export type SubmissionWithRelations = Submission & {
  user?: Pick<Profile, 'id' | 'name' | 'email'> | null
  tryout?: Pick<Tryout, 'id' | 'title'> | null
}

// Form types for creating/editing
export type TryoutFormData = {
  title: string
  description: string
  subject_id: string
  education_level_id: string
  class_id: string | null
  duration_minutes: number
  pricing_model: 'free' | 'freemium' | 'premium'
  tryout_price: number | null
  explanation_price: number | null
  start_time: string | null
  end_time: string | null
  is_global: boolean
}

export type QuestionFormData = {
  question_type: QuestionType
  question_data: QuestionData
  correct_answer: QuestionAnswer
  score: number
  explanation: string
  difficulty: QuestionDifficulty
}