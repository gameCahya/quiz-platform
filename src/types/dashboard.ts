export interface AdminDashboardStats {
  totalUsers: number
  totalSchools: number
  totalTryouts: number
  totalSubmissions: number
  recentTryouts: AdminRecentTryout[]
  recentSubmissions: AdminRecentSubmission[]
}

export interface GuruDashboardStats {
  totalStudents: number
  totalTryouts: number
  totalSubmissions: number
  myTryouts: MyTryout[]
}

export interface SiswaDashboardStats {
  availableTryouts: number
  completedTryouts: number
  averageScore: number
  rank: number
  recentSubmissions: SiswaRecentSubmission[]
}

// Tryout types
export interface AdminRecentTryout {
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
  creator: {
    name: string
    role: string
  } | null
}

export interface MyTryout {
  id: string
  title: string
  created_at: string
}

// Submission types
export interface AdminRecentSubmission {
  id: string
  total_score: number | null
  submitted_at: string
  user: {
    name: string
  } | null
  tryout: {
    title: string
  } | null
}

export interface SiswaRecentSubmission {
  id: string
  total_score: number | null
  submitted_at: string
  tryout: {
    title: string
  } | null
}