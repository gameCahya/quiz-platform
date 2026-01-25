export interface RegisterData {
  email: string
  password: string
  name: string
  role: 'admin' | 'guru' | 'siswa'
  school_id?: string
  education_level_id?: string
  class_id?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'guru' | 'siswa'
  school_id?: string | null
  education_level_id?: string | null
  class_id?: string | null
  phone?: string | null
  student_number?: string | null
  avatar_url?: string | null
  created_at?: string
}
