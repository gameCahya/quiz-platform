import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Users, PlusCircle, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

/**
 * Guru Dashboard Page
 * Shows overview of teacher's tryouts, students, and recent activity
 */
export default async function GuruDashboardPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile with role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, school_id')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error('Profile fetch error:', error)
    redirect('/login')
  }

  // Verify guru role
  if (profile.role !== 'guru') {
    redirect(`/dashboard/${profile.role}`)
  }

  // Fetch guru's statistics (example queries - adjust based on your needs)
  const [tryoutsResult, studentsResult] = await Promise.all([
    // Get teacher's tryouts count
    supabase
      .from('tryouts')
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', profile.id),
    
    // Get students count in same school
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', profile.school_id)
      .eq('role', 'siswa'),
  ])

  const totalTryouts = tryoutsResult.count || 0
  const totalStudents = studentsResult.count || 0

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
              Kelola tryout dan pantau perkembangan siswa Anda
            </p>
          </div>
          
          {/* Quick Action Button */}
          <Link href="/dashboard/guru/tryouts/create">
            <Button size="lg" className="gap-2">
              <PlusCircle className="h-5 w-5" />
              Buat Tryout Baru
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Tryout
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTryouts}</div>
              <p className="text-xs text-gray-500">
                Tryout yang Anda buat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Siswa
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-gray-500">
                Siswa di sekolah Anda
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tryout Aktif
              </CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500">
                Sedang berlangsung
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Pengerjaan
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500">
                Submission masuk
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Tryouts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tryout Terbaru</CardTitle>
                  <CardDescription>
                    Tryout yang baru Anda buat
                  </CardDescription>
                </div>
                <Link href="/dashboard/guru/tryouts">
                  <Button variant="outline" size="sm">
                    Lihat Semua
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {totalTryouts === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-1 text-lg font-medium text-gray-900">
                    Belum ada tryout
                  </h3>
                  <p className="mb-4 text-sm text-gray-500">
                    Mulai dengan membuat tryout pertama Anda
                  </p>
                  <Link href="/dashboard/guru/tryouts/create">
                    <Button className="gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Buat Tryout
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Tryout akan ditampilkan di sini setelah dibuat
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>
                Pengerjaan tryout oleh siswa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <TrendingUp className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-1 text-lg font-medium text-gray-900">
                  Belum ada aktivitas
                </h3>
                <p className="text-sm text-gray-500">
                  Aktivitas siswa akan muncul di sini
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

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
              <Link href="/dashboard/guru/tryouts/create">
                <Button variant="outline" className="h-auto w-full justify-start gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <PlusCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Buat Tryout</p>
                    <p className="text-xs text-gray-500">Buat tryout baru untuk siswa</p>
                  </div>
                </Button>
              </Link>

              <Link href="/dashboard/guru/students">
                <Button variant="outline" className="h-auto w-full justify-start gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Daftar Siswa</p>
                    <p className="text-xs text-gray-500">Lihat siswa di sekolah Anda</p>
                  </div>
                </Button>
              </Link>

              <Link href="/dashboard/guru/results">
                <Button variant="outline" className="h-auto w-full justify-start gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Hasil Tryout</p>
                    <p className="text-xs text-gray-500">Lihat hasil pengerjaan siswa</p>
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