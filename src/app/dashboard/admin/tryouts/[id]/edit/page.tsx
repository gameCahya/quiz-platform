import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { QuestionBuilder } from '@/components/question/QuestionBuilder'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getQuestionsByTryout } from '@/app/actions/question'

interface CreateQuestionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CreateQuestionPage(props: CreateQuestionPageProps) {
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
    .select('id, title, creator_id')
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

  // Get existing questions to determine next question number
  const questionsResult = await getQuestionsByTryout(params.id)
  const existingQuestions = questionsResult.success ? questionsResult.data || [] : []
  const nextQuestionNumber = existingQuestions.length + 1

  return (
    <DashboardLayout user={profile}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/${profile.role}/tryouts/${params.id}/questions`}
            className="inline-flex"
          >
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Tambah Soal Baru</h1>
            <p className="text-muted-foreground mt-1">
              {tryout.title} - Soal #{nextQuestionNumber}
            </p>
          </div>
        </div>

        {/* Question Builder */}
        <QuestionBuilder
          tryoutId={params.id}
          questionNumber={nextQuestionNumber}
          userRole={profile.role}
        />
      </div>
    </DashboardLayout>
  )
}