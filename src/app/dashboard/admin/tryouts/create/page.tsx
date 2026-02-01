import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TryoutForm } from '@/components/tryout/TryoutForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * Create Tryout Page (Admin/Guru)
 */
export default async function CreateTryoutPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, email, role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role === 'siswa') {
    redirect('/login')
  }

  // Get schools list (for admin)
  let schools: Array<{ id: string; name: string }> = []
  if (profile.role === 'admin') {
    const { data: schoolsData } = await supabase
      .from('schools')
      .select('id, name')
      .order('name')

    schools = schoolsData || []
  }

  const backUrl =
    profile.role === 'admin'
      ? '/dashboard/admin/tryouts'
      : '/dashboard/guru/tryouts'

  return (
    <DashboardLayout user={profile}>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back Button */}
        <Link href={backUrl}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </Link>

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buat Tryout Baru</h1>
          <p className="mt-2 text-gray-600">
            Isi informasi dasar tryout. Anda bisa menambahkan soal setelah tryout dibuat.
          </p>
        </div>

        {/* Form */}
        <TryoutForm role={profile.role} schools={schools} />
      </div>
    </DashboardLayout>
  )
}