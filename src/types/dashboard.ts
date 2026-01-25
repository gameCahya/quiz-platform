// types/dashboard.ts
export interface AdminStats {
  totalUsers: number
  totalTryouts: number
  totalSchools: number
  revenue: number
}

export interface GuruStats {
  totalTryouts: number
  totalStudents: number
  totalSubmissions: number
}

export interface SiswaStats {
  availableTryouts: number
  completedTryouts: number
  averageScore: number
}

export interface DashboardData<T> {
  profile: any // You can replace with Profile type
  stats: T
}
