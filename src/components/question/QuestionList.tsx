'use client'

import { useState } from 'react'
import type { QuestionRow } from '@/types/question'
import { QUESTION_TYPE_LABELS } from '@/types/question'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  GripVertical,
  FileQuestion,
} from 'lucide-react'
import { deleteQuestion, duplicateQuestion } from '@/app/actions/question'
import { useRouter } from 'next/navigation'

interface QuestionListProps {
  questions: QuestionRow[]
  tryoutId: string
  userRole: 'admin' | 'guru' | 'siswa'
}

export function QuestionList({ questions, tryoutId, userRole }: QuestionListProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!selectedQuestion) return

    setIsDeleting(true)
    const result = await deleteQuestion(selectedQuestion.id)

    if (result.success) {
      setDeleteDialogOpen(false)
      setSelectedQuestion(null)
      router.refresh()
    } else {
      alert(`Error: ${result.error}`)
    }
    setIsDeleting(false)
  }

  const handleDuplicate = async (questionId: string) => {
    setIsDuplicating(questionId)
    const result = await duplicateQuestion(questionId)

    if (result.success) {
      router.refresh()
    } else {
      alert(`Error: ${result.error}`)
    }
    setIsDuplicating(null)
  }

  const handleEdit = (questionId: string) => {
    router.push(`/dashboard/${userRole}/tryouts/${tryoutId}/questions/${questionId}/edit`)
  }

  if (questions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Belum Ada Soal</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Mulai tambahkan soal untuk tryout ini. Anda bisa membuat berbagai jenis
            soal seperti pilihan ganda, essay, dan lainnya.
          </p>
          <Button onClick={() => router.push(`/dashboard/${userRole}/tryouts/${tryoutId}/questions/create`)}>
            <FileQuestion className="h-4 w-4 mr-2" />
            Tambah Soal Pertama
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {questions.map((question) => (
          <Card key={question.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {/* Drag Handle */}
                  <button
                    className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground hover:text-foreground"
                    aria-label="Reorder question"
                  >
                    <GripVertical className="h-5 w-5" />
                  </button>

                  {/* Question Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        #{question.question_number}
                      </Badge>
                      <Badge variant="secondary">
                        {QUESTION_TYPE_LABELS[question.question_type]}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        {question.score} poin
                      </Badge>
                    </div>

                    {/* Question Preview */}
                    <div className="text-sm text-muted-foreground">
                      <QuestionPreview question={question} />
                    </div>
                  </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(question.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDuplicate(question.id)}
                      disabled={isDuplicating === question.id}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {isDuplicating === question.id ? 'Duplicating...' : 'Duplikat'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedQuestion(question)
                        setDeleteDialogOpen(true)
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Soal?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus soal nomor {selectedQuestion?.question_number}?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Helper component to preview question content
function QuestionPreview({ question }: { question: QuestionRow }) {
  const data = question.question_data

  // Extract first text content from question
  const getPreviewText = (): string => {
    if ('question' in data && Array.isArray(data.question)) {
      const firstTextBlock = data.question.find((block) => block.type === 'text')
      if (firstTextBlock && 'content' in firstTextBlock) {
        const text = firstTextBlock.content as string
        return text.length > 150 ? text.substring(0, 150) + '...' : text
      }
    }
    return 'Lihat soal untuk preview lengkap'
  }

  return <p className="line-clamp-2">{getPreviewText()}</p>
}