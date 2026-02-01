'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { CreateTryoutInput, PricingModel } from '@/types/tryout'
import { createTryout } from '@/app/actions/tryout'
import { Loader2 } from 'lucide-react'

type TryoutFormProps = {
  role: 'admin' | 'guru'
  schools: Array<{ id: string; name: string }>
}

type FormData = {
  title: string
  description: string
  school_id: string
  is_global: boolean
  pricing_model: PricingModel
  tryout_price: number
  explanation_price: number
  has_explanation: boolean
  duration_minutes: number | null
  start_time: string
  end_time: string
}

export function TryoutForm({ role, schools }: TryoutFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      school_id: '',
      is_global: role === 'admin' ? false : false,
      pricing_model: 'free',
      tryout_price: 0,
      explanation_price: 0,
      has_explanation: true,
      duration_minutes: null,
      start_time: '',
      end_time: '',
    },
  })

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const input: CreateTryoutInput = {
        title: data.title,
        description: data.description || undefined,
        school_id: data.school_id || null,
        is_global: data.is_global,
        pricing_model: data.pricing_model,
        tryout_price: data.tryout_price,
        explanation_price: data.explanation_price,
        has_explanation: data.has_explanation,
        duration_minutes: data.duration_minutes || null,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
      }

      const result = await createTryout(input)

      if (result.success && result.data) {
        // Redirect to tryout list
        const basePath = role === 'admin' ? '/dashboard/admin' : '/dashboard/guru'
        router.push(`${basePath}/tryouts`)
      } else {
        alert(`Error: ${result.error}`)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
          <CardDescription>Informasi umum tentang tryout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Judul Tryout <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="contoh: Tryout UTBK Saintek 2026"
              {...register('title', {
                required: 'Judul harus diisi',
                minLength: {
                  value: 3,
                  message: 'Judul minimal 3 karakter',
                },
                maxLength: {
                  value: 200,
                  message: 'Judul maksimal 200 karakter',
                },
              })}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Jelaskan tentang tryout ini..."
              rows={4}
              {...register('description', {
                maxLength: {
                  value: 1000,
                  message: 'Deskripsi maksimal 1000 karakter',
                },
              })}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card>
        <CardHeader>
          <CardTitle>Target Peserta</CardTitle>
          <CardDescription>Siapa yang bisa mengakses tryout ini</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Global/School (Admin only) */}
          {role === 'admin' && (
            <div className="space-y-2">
              <Label>Jangkauan</Label>
              <Controller
                name="is_global"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(value === 'true')}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="global" />
                      <Label htmlFor="global" className="font-normal">
                        Global (Semua siswa)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="school" />
                      <Label htmlFor="school" className="font-normal">
                        Tingkat Sekolah
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
          )}

          {/* School Selection (Admin only, if not global) */}
          {role === 'admin' && (
            <Controller
              name="is_global"
              control={control}
              render={({ field: isGlobalField }) => (
                <>
                  {!isGlobalField.value && (
                    <div className="space-y-2">
                      <Label htmlFor="school_id">Pilih Sekolah</Label>
                      <Controller
                        name="school_id"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih sekolah..." />
                            </SelectTrigger>
                            <SelectContent>
                              {schools.map((school) => (
                                <SelectItem key={school.id} value={school.id}>
                                  {school.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  )}
                </>
              )}
            />
          )}

          {role === 'guru' && (
            <p className="text-sm text-gray-600">
              Tryout ini hanya akan terlihat oleh siswa di sekolah Anda
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pricing Model */}
      <Card>
        <CardHeader>
          <CardTitle>Model Harga</CardTitle>
          <CardDescription>Tentukan model bisnis tryout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            name="pricing_model"
            control={control}
            render={({ field: pricingField }) => (
              <>
                <RadioGroup
                  value={pricingField.value}
                  onValueChange={(value) => pricingField.onChange(value as PricingModel)}
                >
                  {/* Free */}
                  <div className="flex items-start space-x-2 rounded-lg border p-4">
                    <RadioGroupItem value="free" id="free" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="free" className="font-semibold">
                        Gratis Total
                      </Label>
                      <p className="text-sm text-gray-600">
                        Tryout dan pembahasan gratis untuk semua siswa
                      </p>
                    </div>
                  </div>

                  {/* Freemium */}
                  <div className="flex items-start space-x-2 rounded-lg border p-4">
                    <RadioGroupItem value="freemium" id="freemium" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="freemium" className="font-semibold">
                        Freemium
                      </Label>
                      <p className="text-sm text-gray-600">
                        Tryout gratis, pembahasan berbayar
                      </p>

                      {pricingField.value === 'freemium' && (
                        <Controller
                          name="explanation_price"
                          control={control}
                          render={({ field: priceField }) => (
                            <div className="mt-4 space-y-2">
                              <Label htmlFor="explanation_price">
                                Harga Pembahasan (Rp)
                              </Label>
                              <Input
                                id="explanation_price"
                                type="number"
                                min="0"
                                value={priceField.value}
                                onChange={(e) =>
                                  priceField.onChange(Number(e.target.value))
                                }
                              />
                              <div className="flex gap-2">
                                {[10000, 15000, 25000, 35000, 50000].map((price) => (
                                  <Button
                                    key={price}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => priceField.onChange(price)}
                                  >
                                    {price / 1000}k
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  {/* Premium */}
                  <div className="flex items-start space-x-2 rounded-lg border p-4">
                    <RadioGroupItem value="premium" id="premium" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="premium" className="font-semibold">
                        Premium Bundle
                      </Label>
                      <p className="text-sm text-gray-600">
                        Tryout + pembahasan berbayar (paket lengkap)
                      </p>

                      {pricingField.value === 'premium' && (
                        <Controller
                          name="tryout_price"
                          control={control}
                          render={({ field: priceField }) => (
                            <div className="mt-4 space-y-2">
                              <Label htmlFor="tryout_price">Harga Paket (Rp)</Label>
                              <Input
                                id="tryout_price"
                                type="number"
                                min="0"
                                value={priceField.value}
                                onChange={(e) =>
                                  priceField.onChange(Number(e.target.value))
                                }
                              />
                              <div className="flex gap-2">
                                {[25000, 35000, 50000, 75000, 100000].map((price) => (
                                  <Button
                                    key={price}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => priceField.onChange(price)}
                                  >
                                    {price / 1000}k
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        />
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </>
            )}
          />
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan</CardTitle>
          <CardDescription>Durasi dan jadwal tryout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Durasi (menit)</Label>
            <Input
              id="duration_minutes"
              type="number"
              min="1"
              max="480"
              placeholder="contoh: 120"
              {...register('duration_minutes', {
                valueAsNumber: true,
              })}
            />
            <p className="text-sm text-gray-500">
              Kosongkan jika tidak ada batasan waktu
            </p>
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="start_time">Waktu Mulai (opsional)</Label>
            <Input
              id="start_time"
              type="datetime-local"
              {...register('start_time')}
            />
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label htmlFor="end_time">Waktu Selesai (opsional)</Label>
            <Input id="end_time" type="datetime-local" {...register('end_time')} />
          </div>

          {/* Has Explanation */}
          <Controller
            name="has_explanation"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="has_explanation" className="font-semibold">
                    Sertakan Pembahasan
                  </Label>
                  <p className="text-sm text-gray-600">
                    Aktifkan jika tryout memiliki pembahasan
                  </p>
                </div>
                <Switch
                  id="has_explanation"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Membuat...' : 'Buat Tryout'}
        </Button>
      </div>
    </form>
  )
}