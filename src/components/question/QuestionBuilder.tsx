'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import type { QuestionData } from '@/types/question'
import { DEFAULT_QUESTION_SCORE } from '@/types/question'
import { createQuestion } from '@/app/actions/question'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Save } from 'lucide-react'

interface QuestionBuilderProps {
  tryoutId: string
  questionNumber: number
  userRole: 'admin' | 'guru'
}

interface QuestionFormData {
  questionType: QuestionData['type']
  score: number
  // Multiple Choice fields
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  optionE: string
  correctAnswer: string
  explanation: string
  // True/False fields
  trueFalseAnswer: boolean
  // Short Answer fields
  shortAnswers: string // comma-separated
  caseSensitive: boolean
  // Essay fields
  minWords: number
  maxWords: number
  rubric: string
  sampleAnswer: string
}

export function QuestionBuilder({
  tryoutId,
  questionNumber,
  userRole,
}: QuestionBuilderProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm<QuestionFormData>({
    defaultValues: {
      questionType: 'multiple_choice',
      score: DEFAULT_QUESTION_SCORE,
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      optionE: '',
      correctAnswer: 'A',
      explanation: '',
      trueFalseAnswer: true,
      shortAnswers: '',
      caseSensitive: false,
      minWords: 0,
      maxWords: 0,
      rubric: '',
      sampleAnswer: '',
    },
  })

  const onSubmit = async (data: QuestionFormData) => {
    setIsSubmitting(true)

    try {
      let questionData: QuestionData['data']

      // Build question data based on type
      switch (data.questionType) {
        case 'multiple_choice':
          questionData = {
            question: [{ type: 'text', content: data.questionText }],
            options: [
              { id: 'A', content: [{ type: 'text', content: data.optionA }] },
              { id: 'B', content: [{ type: 'text', content: data.optionB }] },
              { id: 'C', content: [{ type: 'text', content: data.optionC }] },
              { id: 'D', content: [{ type: 'text', content: data.optionD }] },
            ],
            correctAnswer: data.correctAnswer,
            explanation: data.explanation
              ? [{ type: 'text', content: data.explanation }]
              : undefined,
          }
          // Add option E if filled
          if (data.optionE?.trim()) {
            questionData.options.push({
              id: 'E',
              content: [{ type: 'text', content: data.optionE }],
            })
          }
          break

        case 'true_false':
          questionData = {
            question: [{ type: 'text', content: data.questionText }],
            correctAnswer: data.trueFalseAnswer,
            explanation: data.explanation
              ? [{ type: 'text', content: data.explanation }]
              : undefined,
          }
          break

        case 'short_answer':
          questionData = {
            question: [{ type: 'text', content: data.questionText }],
            correctAnswers: data.shortAnswers
              .split(',')
              .map((ans) => ans.trim())
              .filter((ans) => ans.length > 0),
            caseSensitive: data.caseSensitive,
            explanation: data.explanation
              ? [{ type: 'text', content: data.explanation }]
              : undefined,
          }
          break

        case 'essay':
          questionData = {
            question: [{ type: 'text', content: data.questionText }],
            minWords: data.minWords || undefined,
            maxWords: data.maxWords || undefined,
            rubric: data.rubric
              ? [{ type: 'text', content: data.rubric }]
              : undefined,
            sampleAnswer: data.sampleAnswer
              ? [{ type: 'text', content: data.sampleAnswer }]
              : undefined,
          }
          break

        default:
          alert('Jenis soal ini belum diimplementasikan')
          setIsSubmitting(false)
          return
      }

      // Create question
      const result = await createQuestion({
        tryout_id: tryoutId,
        question_number: questionNumber,
        question_type: data.questionType,
        question_data: questionData,
        score: data.score,
      })

      if (result.success) {
        router.push(`/dashboard/${userRole}/tryouts/${tryoutId}/questions`)
        router.refresh()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Terjadi kesalahan saat menyimpan soal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Question Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Jenis Soal</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="questionType"
            control={control}
            render={({ field }) => (
              <Tabs value={field.value} onValueChange={field.onChange}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="multiple_choice">Pilihan Ganda</TabsTrigger>
                  <TabsTrigger value="true_false">Benar/Salah</TabsTrigger>
                  <TabsTrigger value="short_answer">Isian Singkat</TabsTrigger>
                  <TabsTrigger value="essay">Essay</TabsTrigger>
                </TabsList>

                {/* Multiple Choice Form */}
                <TabsContent value="multiple_choice" className="space-y-6 mt-6">
                  <MultipleChoiceForm control={control} errors={errors} />
                </TabsContent>

                {/* True/False Form */}
                <TabsContent value="true_false" className="space-y-6 mt-6">
                  <TrueFalseForm control={control} errors={errors} />
                </TabsContent>

                {/* Short Answer Form */}
                <TabsContent value="short_answer" className="space-y-6 mt-6">
                  <ShortAnswerForm control={control} errors={errors} />
                </TabsContent>

                {/* Essay Form */}
                <TabsContent value="essay" className="space-y-6 mt-6">
                  <EssayForm control={control} errors={errors} />
                </TabsContent>
              </Tabs>
            )}
          />
        </CardContent>
      </Card>

      {/* Score Setting */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Poin</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="score"
            control={control}
            rules={{
              required: 'Poin harus diisi',
              min: { value: 1, message: 'Poin minimal 1' },
              max: { value: 100, message: 'Poin maksimal 100' },
            }}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="score">Poin Soal</Label>
                <Input
                  id="score"
                  type="number"
                  min={1}
                  max={100}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
                {errors.score && (
                  <p className="text-sm text-red-600">{errors.score.message}</p>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Menyimpan...' : 'Simpan Soal'}
        </Button>
      </div>
    </form>
  )
}

// ============================================
// MULTIPLE CHOICE FORM
// ============================================
interface FormProps {
  control: ReturnType<typeof useForm<QuestionFormData>>['control']
  errors: ReturnType<typeof useForm<QuestionFormData>>['formState']['errors']
}

function MultipleChoiceForm({ control, errors }: FormProps) {
  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor="questionText">Pertanyaan *</Label>
        <Controller
          name="questionText"
          control={control}
          rules={{ required: 'Pertanyaan harus diisi' }}
          render={({ field }) => (
            <>
              <Textarea
                id="questionText"
                placeholder="Masukkan pertanyaan di sini..."
                rows={4}
                {...field}
              />
              {errors.questionText && (
                <p className="text-sm text-red-600">{errors.questionText.message}</p>
              )}
            </>
          )}
        />
      </div>

      <Separator />

      {/* Options */}
      <div className="space-y-4">
        <h3 className="font-semibold">Pilihan Jawaban</h3>

        {['A', 'B', 'C', 'D', 'E'].map((option, index) => (
          <div key={option} className="space-y-2">
            <Label htmlFor={`option${option}`}>
              Pilihan {option} {index < 4 && '*'}
            </Label>
            <Controller
              name={`option${option}` as keyof QuestionFormData}
              control={control}
              rules={index < 4 ? { required: `Pilihan ${option} harus diisi` } : undefined}
              render={({ field }) => (
                <>
                  <Input
                    id={`option${option}`}
                    placeholder={`Jawaban ${option}${index === 4 ? ' (opsional)' : ''}`}
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                  {errors[`option${option}` as keyof QuestionFormData] && (
                    <p className="text-sm text-red-600">
                      {errors[`option${option}` as keyof QuestionFormData]?.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        ))}
      </div>

      <Separator />

      {/* Correct Answer */}
      <div className="space-y-2">
        <Label>Jawaban Benar *</Label>
        <Controller
          name="correctAnswer"
          control={control}
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange}>
              {['A', 'B', 'C', 'D', 'E'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`answer-${option.toLowerCase()}`} />
                  <Label htmlFor={`answer-${option.toLowerCase()}`}>Pilihan {option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
      </div>

      <Separator />

      {/* Explanation */}
      <div className="space-y-2">
        <Label htmlFor="explanation">Pembahasan (opsional)</Label>
        <Controller
          name="explanation"
          control={control}
          render={({ field }) => (
            <Textarea
              id="explanation"
              placeholder="Jelaskan cara mengerjakan soal ini..."
              rows={4}
              {...field}
            />
          )}
        />
      </div>
    </div>
  )
}

// ============================================
// TRUE/FALSE FORM
// ============================================
function TrueFalseForm({ control, errors }: FormProps) {
  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor="questionText">Pernyataan *</Label>
        <Controller
          name="questionText"
          control={control}
          rules={{ required: 'Pernyataan harus diisi' }}
          render={({ field }) => (
            <>
              <Textarea
                id="questionText"
                placeholder="Masukkan pernyataan yang akan dinilai benar atau salah..."
                rows={4}
                {...field}
              />
              {errors.questionText && (
                <p className="text-sm text-red-600">{errors.questionText.message}</p>
              )}
            </>
          )}
        />
        <p className="text-xs text-muted-foreground">
          Contoh: &quot;Ibukota Indonesia adalah Jakarta&quot;
        </p>
      </div>

      <Separator />

      {/* Correct Answer */}
      <div className="space-y-3">
        <Label>Jawaban Benar *</Label>
        <Controller
          name="trueFalseAnswer"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value ? 'true' : 'false'}
              onValueChange={(value) => field.onChange(value === 'true')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="answer-true" />
                <Label htmlFor="answer-true" className="font-normal">
                  Benar (True)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="answer-false" />
                <Label htmlFor="answer-false" className="font-normal">
                  Salah (False)
                </Label>
              </div>
            </RadioGroup>
          )}
        />
      </div>

      <Separator />

      {/* Explanation */}
      <div className="space-y-2">
        <Label htmlFor="explanation">Pembahasan (opsional)</Label>
        <Controller
          name="explanation"
          control={control}
          render={({ field }) => (
            <Textarea
              id="explanation"
              placeholder="Jelaskan mengapa pernyataan ini benar atau salah..."
              rows={4}
              {...field}
            />
          )}
        />
      </div>
    </div>
  )
}

// ============================================
// SHORT ANSWER FORM
// ============================================
function ShortAnswerForm({ control, errors }: FormProps) {
  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor="questionText">Pertanyaan *</Label>
        <Controller
          name="questionText"
          control={control}
          rules={{ required: 'Pertanyaan harus diisi' }}
          render={({ field }) => (
            <>
              <Textarea
                id="questionText"
                placeholder="Masukkan pertanyaan di sini..."
                rows={4}
                {...field}
              />
              {errors.questionText && (
                <p className="text-sm text-red-600">{errors.questionText.message}</p>
              )}
            </>
          )}
        />
        <p className="text-xs text-muted-foreground">
          Contoh: &quot;Siapa presiden pertama Indonesia?&quot;
        </p>
      </div>

      <Separator />

      {/* Correct Answers */}
      <div className="space-y-2">
        <Label htmlFor="shortAnswers">Jawaban Benar *</Label>
        <Controller
          name="shortAnswers"
          control={control}
          rules={{ required: 'Minimal satu jawaban harus diisi' }}
          render={({ field }) => (
            <>
              <Textarea
                id="shortAnswers"
                placeholder="Masukkan jawaban yang benar (pisahkan dengan koma jika lebih dari satu)"
                rows={3}
                {...field}
              />
              {errors.shortAnswers && (
                <p className="text-sm text-red-600">{errors.shortAnswers.message}</p>
              )}
            </>
          )}
        />
        <p className="text-xs text-muted-foreground">
          Contoh: &quot;Soekarno, Ir. Soekarno&quot; (untuk accept multiple answers)
        </p>
      </div>

      {/* Case Sensitive */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label htmlFor="caseSensitive" className="font-normal">
            Case Sensitive
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Jika aktif, &quot;Soekarno&quot; berbeda dengan &quot;soekarno&quot;
          </p>
        </div>
        <Controller
          name="caseSensitive"
          control={control}
          render={({ field }) => (
            <Switch
              id="caseSensitive"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <Separator />

      {/* Explanation */}
      <div className="space-y-2">
        <Label htmlFor="explanation">Pembahasan (opsional)</Label>
        <Controller
          name="explanation"
          control={control}
          render={({ field }) => (
            <Textarea
              id="explanation"
              placeholder="Jelaskan jawaban yang benar..."
              rows={4}
              {...field}
            />
          )}
        />
      </div>
    </div>
  )
}

// ============================================
// ESSAY FORM
// ============================================
function EssayForm({ control, errors }: FormProps) {
  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor="questionText">Pertanyaan Essay *</Label>
        <Controller
          name="questionText"
          control={control}
          rules={{ required: 'Pertanyaan harus diisi' }}
          render={({ field }) => (
            <>
              <Textarea
                id="questionText"
                placeholder="Masukkan pertanyaan essay di sini..."
                rows={5}
                {...field}
              />
              {errors.questionText && (
                <p className="text-sm text-red-600">{errors.questionText.message}</p>
              )}
            </>
          )}
        />
        <p className="text-xs text-muted-foreground">
          Contoh: &quot;Jelaskan dampak revolusi industri terhadap masyarakat Eropa pada abad ke-19&quot;
        </p>
      </div>

      <Separator />

      {/* Word Limits */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minWords">Minimal Kata (opsional)</Label>
          <Controller
            name="minWords"
            control={control}
            render={({ field }) => (
              <Input
                id="minWords"
                type="number"
                min={0}
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxWords">Maksimal Kata (opsional)</Label>
          <Controller
            name="maxWords"
            control={control}
            render={({ field }) => (
              <Input
                id="maxWords"
                type="number"
                min={0}
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Rubric */}
      <div className="space-y-2">
        <Label htmlFor="rubric">Rubrik Penilaian (opsional)</Label>
        <Controller
          name="rubric"
          control={control}
          render={({ field }) => (
            <Textarea
              id="rubric"
              placeholder="Kriteria penilaian untuk essay ini..."
              rows={4}
              {...field}
            />
          )}
        />
        <p className="text-xs text-muted-foreground">
          Contoh: &quot;Poin penuh jika menjelaskan minimal 3 dampak dengan contoh konkret&quot;
        </p>
      </div>

      <Separator />

      {/* Sample Answer */}
      <div className="space-y-2">
        <Label htmlFor="sampleAnswer">Contoh Jawaban (opsional)</Label>
        <Controller
          name="sampleAnswer"
          control={control}
          render={({ field }) => (
            <Textarea
              id="sampleAnswer"
              placeholder="Contoh jawaban yang baik untuk soal ini..."
              rows={6}
              {...field}
            />
          )}
        />
        <p className="text-xs text-muted-foreground">
          Ini akan digunakan sebagai referensi untuk koreksi manual
        </p>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm font-medium text-yellow-800">ℹ️ Catatan Essay</p>
        <p className="text-xs text-yellow-700 mt-1">
          Essay harus dikoreksi manual oleh guru. Sistem tidak bisa scoring otomatis untuk jenis soal ini.
        </p>
      </div>
    </div>
  )
}