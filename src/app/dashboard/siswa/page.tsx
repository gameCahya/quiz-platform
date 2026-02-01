import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Trophy, Clock, CheckCircle, TrendingUp, Target } from 'lucide-react'
import Link from 'next/link'

/**
 * Siswa Dashboard Page
 * Shows available tryouts, student's progress, and leaderboard position
 */
export default async function SiswaDashboardPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile with role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, school_id, education_level_id, class_id')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error('Profile fetch error:', error)
    redirect('/login')
  }

  // Verify siswa role
  if (profile.role !== 'siswa') {
    redirect(`/dashboard/${profile.role}`)
  }

  // Fetch student's statistics
  const [submissionsResult, availableTryoutsResult] = await Promise.all([
    // Get student's submissions count
    supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id),
    
    // Get available tryouts count (global + school-level)
    supabase
      .from('tryouts')
      .select('id', { count: 'exact', head: true })
      .or(`is_global.eq.true,school_id.eq.${profile.school_id}`),
  ])

  const totalSubmissions = submissionsResult.count || 0
  const availableTryouts = availableTryoutsResult.count || 0

  return (
    <DashboardLayout user={profile}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Selamat Datang, {profile.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              Tingkatkan kemampuanmu dengan mengerjakan tryout
            </p>
          </div>
          
          {/* Quick Action Button */}
          <Link href="/dashboard/siswa/tryouts">
            <Button size="lg" className="gap-2">
              <BookOpen className="h-5 w-5" />
              Lihat Tryout
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tryout Tersedia
              </CardTitle>
              <BookOpen className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableTryouts}</div>
              <p className="text-xs text-gray-500">
                Siap untuk dikerjakan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tryout Selesai
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubmissions}</div>
              <p className="text-xs text-gray-500">
                Tryout yang sudah dikerjakan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Rata-rata Nilai
              </CardTitle>
              <Target className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-gray-500">
                Belum ada data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Peringkat Kelas
              </CardTitle>
              <Trophy className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-gray-500">
                Belum ada data
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Available Tryouts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tryout Tersedia</CardTitle>
                  <CardDescription>
                    Tryout yang bisa kamu kerjakan sekarang
                  </CardDescription>
                </div>
                <Link href="/dashboard/siswa/tryouts">
                  <Button variant="outline" size="sm">
                    Lihat Semua
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {availableTryouts === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-1 text-lg font-medium text-gray-900">
                    Belum ada tryout tersedia
                  </h3>
                  <p className="text-sm text-gray-500">
                    Tryout baru akan muncul di sini
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Example tryout card - will be populated from database */}
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Tryout akan ditampilkan di sini</h4>
                        <Badge variant="secondary">Free</Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Setelah guru membuat tryout
                      </p>
                    </div>
                    <Button size="sm">Mulai</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Terbaru</CardTitle>
              <CardDescription>
                Tryout yang sudah kamu kerjakan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalSubmissions === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-1 text-lg font-medium text-gray-900">
                    Belum ada riwayat
                  </h3>
                  <p className="text-sm text-gray-500">
                    Mulai mengerjakan tryout untuk melihat riwayat
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Riwayat pengerjaan akan ditampilkan di sini
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Statistik Belajar</CardTitle>
            <CardDescription>
              Pantau perkembangan belajarmu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Total Soal Dikerjakan */}
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-600">Total Soal Dikerjakan</p>
                </div>
              </div>

              {/* Waktu Belajar */}
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0h</p>
                  <p className="text-sm text-gray-600">Total Waktu Belajar</p>
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-600">Hari Berturut-turut</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Navigasi cepat ke fitur yang sering digunakan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/dashboard/siswa/tryouts">
                <Button variant="outline" className="h-auto w-full justify-start gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Mulai Tryout</p>
                    <p className="text-xs text-gray-500">Kerjakan tryout yang tersedia</p>
                  </div>
                </Button>
              </Link>

              <Link href="/dashboard/siswa/history">
                <Button variant="outline" className="h-auto w-full justify-start gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Riwayat Saya</p>
                    <p className="text-xs text-gray-500">Lihat hasil tryout sebelumnya</p>
                  </div>
                </Button>
              </Link>

              <Link href="/dashboard/siswa/leaderboard">
                <Button variant="outline" className="h-auto w-full justify-start gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Trophy className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Leaderboard</p>
                    <p className="text-xs text-gray-500">Lihat peringkat siswa</p>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}