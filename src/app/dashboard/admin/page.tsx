// src/app/dashboard/admin/page.tsx
// Example of how to use the updated DashboardLayout with logout

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getAdminDashboardStats } from '@/app/actions/dashboard'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, email, role')
    .eq('id', user.id)
    .single()

  if (error || !profile || profile.role !== 'admin') {
    redirect('/login')
  }

  // Get dashboard stats
  const stats = await getAdminDashboardStats()

  return (
    <DashboardLayout user={profile}>
      {/* Dashboard Content */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Admin
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {profile.name}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Schools</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.totalSchools}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Tryouts</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.totalTryouts}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Submissions
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.totalSubmissions}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity or other content */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Recent activities will appear here...
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}