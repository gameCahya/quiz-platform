// app/dashboard/guru/page.tsx
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getGuruDashboardStats, getRecentTryouts } from '@/app/actions/dashboard'
import { FileText, Users, ClipboardCheck, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function GuruDashboard() {
  const { profile, stats } = await getGuruDashboardStats()
  const recentTryouts = await getRecentTryouts('guru', 5)

  return (
    <DashboardLayout role="guru">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Guru</h1>
            <p className="text-gray-500 mt-1">
              Selamat datang, <span className="font-medium text-gray-700">{profile.name}</span>!
            </p>
            {profile.schools && (
              <p className="text-sm text-gray-500 mt-1">
                📚 {profile.schools.name}
              </p>
            )}
          </div>
          <Link href="/dashboard/guru/tryouts/create">
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Buat Tryout Baru
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Tryout Saya
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTryouts}</div>
              <p className="text-xs text-gray-500 mt-1">Tryout yang telah dibuat</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Siswa
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-gray-500 mt-1">Siswa di sekolah Anda</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Submission
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              <p className="text-xs text-gray-500 mt-1">Tryout yang sudah dikerjakan</p>
            </CardContent>
          </Card>
        </div>

        {/* My Tryouts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tryout Saya</CardTitle>
            <Link href="/dashboard/guru/tryouts">
              <Button variant="outline" size="sm">Lihat Semua</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTryouts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Belum ada tryout</h3>
                <p className="text-sm mb-4">Buat tryout pertama Anda untuk siswa</p>
                <Link href="/dashboard/guru/tryouts/create">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Buat Tryout Sekarang
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTryouts.map((tryout: any) => (
                  <div
                    key={tryout.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{tryout.title}</h3>
                        {tryout.is_published ? (
                          <Badge variant="default" className="text-xs">Published</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Draft</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{tryout.subjects?.name || 'Umum'}</span>
                        <span>•</span>
                        <span>{tryout.duration_minutes} menit</span>
                        <span>•</span>
                        <span>{tryout.pricing_model === 'free' ? 'Gratis' : 'Berbayar'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/guru/tryouts/${tryout.id}`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                      <Link href={`/dashboard/guru/tryouts/${tryout.id}/results`}>
                        <Button variant="outline" size="sm">Hasil</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tryout Paling Populer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performa Siswa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
