// src/types/database.ts
export type Role = 'admin' | 'guru' | 'siswa'

export type PricingModel = 'free' | 'freemium' | 'premium' | 'premium_bundle'

export interface Profile {
  id: string
  role: Role
  school_id: string | null
  class_id: string | null
  name: string
  email: string
  phone: string | null
  student_number: string | null
  avatar_url: string | null
  created_at: string
}

export interface School {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  created_at: string
}

export interface EducationLevel {
  id: string
  name: string
  grades: number[]
  created_at: string
}

export interface Subject {
  id: string
  name: string
  education_level_id: string
  created_at: string
}

export interface Class {
  id: string
  school_id: string
  education_level_id: string
  grade: string
  section: string
  full_name: string
  student_count: number
  created_at: string
}

export interface Tryout {
  id: string
  title: string
  description: string | null
  creator_id: string
  school_id: string | null
  is_global: boolean
  subject_id: string | null
  education_level_id: string | null
  target_classes: string[] | null
  pricing_model: PricingModel
  tryout_price: number
  explanation_price: number
  duration_minutes: number
  max_attempts: number | null
  attempt_cooldown: number | null
  start_time: string | null
  end_time: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}
