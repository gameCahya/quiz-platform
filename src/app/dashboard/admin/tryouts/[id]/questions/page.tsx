import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { QuestionList } from '@/components/question/QuestionList'
import { getQuestionsByTryout } from '@/app/actions/question'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'

interface QuestionsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function QuestionsPage(props: QuestionsPageProps) {
  const params = await props.params
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

  if (!profile || profile.role === 'siswa') {
    redirect('/login')
  }

  // Get tryout details
  const { data: tryout } = await supabase
    .from('tryouts')
    .select('id, title, description, creator_id, pricing_model, is_global')
    .eq('id', params.id)
    .single()

  if (!tryout) {
    redirect(`/dashboard/${profile.role}/tryouts`)
  }

  // Permission check
  const isOwner = tryout.creator_id === profile.id
  const isAdmin = profile.role === 'admin'

  if (!isOwner && !isAdmin) {
    redirect(`/dashboard/${profile.role}/tryouts`)
  }

  // Get questions
  const questionsResult = await getQuestionsByTryout(params.id)
  const questions = questionsResult.success ? questionsResult.data || [] : []

  // Calculate total score
  const totalScore = questions.reduce((sum, q) => sum + q.score, 0)

  return (
    <DashboardLayout user={profile}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/${profile.role}/tryouts`}
              className="inline-flex"
            >
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Kelola Soal</h1>
              <p className="text-muted-foreground mt-1">{tryout.title}</p>
            </div>
          </div>

          <Link href={`/dashboard/${profile.role}/tryouts/${params.id}/questions/create`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Soal
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <p className="text-sm font-medium text-muted-foreground">
                Total Soal
              </p>
            </div>
            <p className="text-3xl font-bold mt-2">{questions.length}</p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <p className="text-sm font-medium text-muted-foreground">
                Total Poin
              </p>
            </div>
            <p className="text-3xl font-bold mt-2">{totalScore}</p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <p className="text-sm font-medium text-muted-foreground">
                Rata-rata Poin
              </p>
            </div>
            <p className="text-3xl font-bold mt-2">
              {questions.length > 0 ? Math.round(totalScore / questions.length) : 0}
            </p>
          </div>
        </div>

        {/* Question List */}
        <QuestionList
          questions={questions}
          tryoutId={params.id}
          userRole={profile.role}
        />
      </div>
    </DashboardLayout>
  )
}