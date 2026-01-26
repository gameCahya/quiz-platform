import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminDashboardStats } from '@/app/actions/dashboard'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, email, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('Profile error:', profileError)
    redirect('/login')
  }

  // Verify user is admin
  if (profile.role !== 'admin') {
    console.error('Access denied: user is not admin, role:', profile.role)
    redirect(`/dashboard/${profile.role}`)
  }

  // Get dashboard stats
  const stats = await getAdminDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">
          Selamat datang kembali, <span className="font-medium text-gray-700">{profile.name}</span>!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchools}</div>
            <p className="text-xs text-muted-foreground">Active schools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tryouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTryouts}</div>
            <p className="text-xs text-muted-foreground">Created tryouts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">Completed tryouts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tryouts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tryouts</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentTryouts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tryouts yet</p>
          ) : (
            <div className="space-y-4">
              {stats.recentTryouts.map((tryout) => (
                <div key={tryout.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{tryout.title}</h3>
                    <p className="text-sm text-gray-600">
                      By: {tryout.creator?.name || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(tryout.created_at).toLocaleDateString('id-ID')}
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
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentSubmissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No submissions yet</p>
          ) : (
            <div className="space-y-4">
              {stats.recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{submission.tryout?.title || 'Unknown Tryout'}</h3>
                    <p className="text-sm text-gray-600">
                      By: {submission.user?.name || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{submission.total_score || 0}</div>
                    <p className="text-xs text-gray-500">Score</p>
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