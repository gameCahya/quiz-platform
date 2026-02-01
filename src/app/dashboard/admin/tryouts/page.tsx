import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TryoutList } from '@/components/tryout/TryoutList'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { getTryouts } from '@/app/actions/tryout'
import type { PricingModel } from '@/types/tryout'

/**
 * Admin Tryouts List Page
 * Shows all tryouts with filters
 */
export default async function AdminTryoutsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
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
    .select('id, name, email, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/login')
  }

  // Parse search params for filters
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined
  const pricingModelParam =
    typeof searchParams.pricing_model === 'string' ? searchParams.pricing_model : 'all'
  
  // Type-safe pricing model - validate it's a valid PricingModel or 'all'
  const validPricingModels: Array<PricingModel | 'all'> = ['free', 'freemium', 'premium', 'all']
  const pricingModel = validPricingModels.includes(pricingModelParam as PricingModel | 'all')
    ? (pricingModelParam as PricingModel | 'all')
    : 'all'

  const isGlobal =
    searchParams.is_global === 'true'
      ? true
      : searchParams.is_global === 'false'
        ? false
        : undefined

  // Fetch tryouts with filters
  const result = await getTryouts(
    {
      search,
      pricing_model: pricingModel,
      is_global: isGlobal,
    },
    {
      field: 'created_at',
      direction: 'desc',
    }
  )

  const tryouts = result.success ? result.data || [] : []

  return (
    <DashboardLayout user={profile}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Tryout</h1>
            <p className="mt-2 text-gray-600">
              Buat dan kelola tryout untuk siswa
            </p>
          </div>

          {/* Create Button */}
          <Link href="/dashboard/admin/tryouts/create">
            <Button size="lg" className="gap-2">
              <PlusCircle className="h-5 w-5" />
              Buat Tryout Baru
            </Button>
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-600">Total Tryout</p>
            <p className="mt-1 text-2xl font-bold">{tryouts.length}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-600">Tryout Global</p>
            <p className="mt-1 text-2xl font-bold">
              {tryouts.filter((t) => t.is_global).length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-600">Tryout Sekolah</p>
            <p className="mt-1 text-2xl font-bold">
              {tryouts.filter((t) => !t.is_global).length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-600">Tryout Premium</p>
            <p className="mt-1 text-2xl font-bold">
              {tryouts.filter((t) => t.pricing_model === 'premium').length}
            </p>
          </div>
        </div>

        {/* Tryout List Component */}
        <TryoutList tryouts={tryouts} role="admin" />
      </div>
    </DashboardLayout>
  )
}