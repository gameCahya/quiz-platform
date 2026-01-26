import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSiswaDashboardStats, getRecentTryouts } from '@/app/actions/dashboard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function SiswaDashboard() {
  const stats = await getSiswaDashboardStats()
  const recentTryouts = await getRecentTryouts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Siswa</h1>
        <p className="text-gray-600">Selamat datang kembali!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tryout Tersedia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableTryouts}</div>
            <p className="text-xs text-muted-foreground">
              Tryout yang bisa kamu kerjakan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sudah Dikerjakan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTryouts}</div>
            <p className="text-xs text-muted-foreground">
              Tryout yang sudah selesai
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata-rata Nilai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageScore || '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari semua tryout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Peringkat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{stats.rank}</div>
            <p className="text-xs text-muted-foreground">
              Di leaderboard
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tryouts */}
      <Card>
        <CardHeader>
          <CardTitle>Tryout Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTryouts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Belum ada tryout tersedia
            </p>
          ) : (
            <div className="space-y-4">
              {recentTryouts.map((tryout: {
                id: string
                title: string
                description: string | null
                duration_minutes: number | null
                pricing_model: string | null
                tryout_price: number | null
                explanation_price: number | null
                creator: { name: string; role: string } | null
              }) => (
                <div 
                  key={tryout.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{tryout.title}</h3>
                    <p className="text-sm text-gray-600">
                      {tryout.description || 'Tidak ada deskripsi'}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>⏱️ {tryout.duration_minutes || '-'} menit</span>
                      <span>
                        👤 {tryout.creator?.name || 'Unknown'} ({tryout.creator?.role || '-'})
                      </span>
                      {tryout.pricing_model === 'free' && (
                        <span className="text-green-600 font-medium">🎉 GRATIS</span>
                      )}
                      {tryout.pricing_model === 'freemium' && (
                        <span className="text-blue-600 font-medium">
                          💰 Pembahasan Rp {tryout.explanation_price?.toLocaleString()}
                        </span>
                      )}
                      {tryout.pricing_model === 'premium' && (
                        <span className="text-purple-600 font-medium">
                          💎 Premium Rp {tryout.tryout_price?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/tryout/${tryout.id}`}>
                      <Button variant="outline" size="sm">
                        Lihat Detail
                      </Button>
                    </Link>
                    <Link href={`/tryout/${tryout.id}/start`}>
                      <Button size="sm">
                        Mulai
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Tryout</CardTitle>
        </CardHeader>
        <CardContent>
          {!stats.recentSubmissions || stats.recentSubmissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Belum ada riwayat tryout
            </p>
          ) : (
            <div className="space-y-4">
              {stats.recentSubmissions.map((submission: {
                id: string
                total_score: number | null
                submitted_at: string
                tryout: { title: string } | null
              }) => (
                <div 
                  key={submission.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">
                      {submission.tryout?.title || 'Unknown Tryout'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(submission.submitted_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {submission.total_score || 0}
                    </div>
                    <p className="text-xs text-gray-500">Nilai</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}