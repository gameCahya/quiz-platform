// app/dashboard/admin/page.tsx
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminDashboardStats, getRecentTryouts } from '@/app/actions/dashboard'
import { Users, FileText, School, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AdminDashboard() {
  const { profile, stats } = await getAdminDashboardStats()
  const recentTryouts = await getRecentTryouts('admin', 5)

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-gray-500 mt-1">
            Selamat datang kembali, <span className="font-medium text-gray-700">{profile.name}</span>!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Admin, Guru, dan Siswa</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Tryout
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTryouts.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Tryout yang tersedia</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Sekolah Terdaftar
              </CardTitle>
              <School className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchools.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Sekolah aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp {stats.revenue.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Total pendapatan</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tryouts - sisanya sama seperti sebelumnya */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tryout Terbaru</CardTitle>
            <Link href="/dashboard/admin/tryouts">
              <Button variant="outline" size="sm">Lihat Semua</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTryouts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Belum ada tryout</p>
                <Link href="/dashboard/admin/tryouts/create">
                  <Button className="mt-4" size="sm">Buat Tryout Pertama</Button>
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
                      <h3 className="font-medium">{tryout.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{tryout.subjects?.name || 'Umum'}</span>
                        <span>•</span>
                        <span>{tryout.education_levels?.name || 'Semua Tingkat'}</span>
                        <span>•</span>
                        <span>{tryout.duration_minutes} menit</span>
                      </div>
                    </div>
                    <Link href={`/dashboard/admin/tryouts/${tryout.id}`}>
                      <Button variant="ghost" size="sm">Lihat</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - sama seperti sebelumnya */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/admin/tryouts/create">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <FileText className="h-10 w-10 text-blue-500 mb-3" />
                <h3 className="font-medium mb-1">Buat Tryout Baru</h3>
                <p className="text-sm text-gray-500">Buat tryout global untuk semua siswa</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/schools">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <School className="h-10 w-10 text-green-500 mb-3" />
                <h3 className="font-medium mb-1">Kelola Sekolah</h3>
                <p className="text-sm text-gray-500">Tambah atau edit data sekolah</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/users">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Users className="h-10 w-10 text-purple-500 mb-3" />
                <h3 className="font-medium mb-1">Kelola Users</h3>
                <p className="text-sm text-gray-500">Lihat dan kelola semua pengguna</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
