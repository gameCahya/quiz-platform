// app/dashboard/siswa/page.tsx
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSiswaDashboardStats, getRecentTryouts } from '@/app/actions/dashboard'
import { BookOpen, ClipboardList, TrendingUp, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function SiswaDashboard() {
  const { profile, stats } = await getSiswaDashboardStats()
  const availableTryouts = await getRecentTryouts('siswa', 6)

  return (
    <DashboardLayout role="siswa">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard Siswa</h1>
          <p className="text-gray-500 mt-1">
            Selamat belajar, <span className="font-medium text-gray-700">{profile.name}</span>!
          </p>
          {profile.schools && (
            <p className="text-sm text-gray-500 mt-1">
              📚 {profile.schools.name}
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Tryout Tersedia
              </CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableTryouts}</div>
              <p className="text-xs text-blue-600 mt-1">Siap untuk dikerjakan</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Tryout Selesai
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTryouts}</div>
              <p className="text-xs text-gray-500 mt-1">Total dikerjakan</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Rata-rata Nilai
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}</div>
              <p className="text-xs text-gray-500 mt-1">Dari semua tryout</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Tryouts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tryout Tersedia</CardTitle>
            <Link href="/dashboard/siswa/tryouts">
              <Button variant="outline" size="sm">Lihat Semua</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {availableTryouts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Belum ada tryout tersedia</h3>
                <p className="text-sm">Tryout baru akan muncul di sini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTryouts.map((tryout: any) => (
                  <Card key={tryout.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{tryout.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            {tryout.is_global ? (
                              <Badge variant="default" className="text-xs">Global</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Sekolah</Badge>
                            )}
                            {tryout.pricing_model === 'free' ? (
                              <Badge variant="outline" className="text-xs text-green-600">Gratis</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-blue-600">Premium</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <span>📚</span>
                          <span>{tryout.subjects?.name || 'Umum'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>⏱️</span>
                          <span>{tryout.duration_minutes} menit</span>
                        </div>
                        {tryout.education_levels && (
                          <div className="flex items-center gap-2">
                            <span>🎓</span>
                            <span>{tryout.education_levels.name}</span>
                          </div>
                        )}
                      </div>
                      <Link href={`/dashboard/siswa/tryouts/${tryout.id}`}>
                        <Button className="w-full">
                          <Play className="mr-2 h-4 w-4" />
                          Mulai Tryout
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle>Hasil Tryout Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
