'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import type { PricingModel } from '@/types/tryout'
import { createTryout, updateTryout } from '@/app/actions/tryout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TryoutFormData {
  title: string
  description: string
  pricing_model: PricingModel
  tryout_price: number
  explanation_price: number
  has_explanation: boolean
  is_global: boolean
  school_id: string
  duration_minutes: number
  start_time: string
  end_time: string
}

interface TryoutFormProps {
  mode: 'create' | 'edit'
  tryoutId?: string
  initialData?: Partial<TryoutFormData>
  role: 'admin' | 'guru'
  userSchoolId: string
  schools: Array<{ id: string; name: string }>
}

export function TryoutForm({
  mode = 'create',
  tryoutId,
  initialData,
  role,
  userSchoolId,
  schools,
}: TryoutFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: TryoutFormData = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    pricing_model: initialData?.pricing_model || 'free',
    tryout_price: initialData?.tryout_price || 0,
    explanation_price: initialData?.explanation_price || 0,
    has_explanation: initialData?.has_explanation ?? true,
    is_global: initialData?.is_global ?? false,
    school_id: initialData?.school_id || userSchoolId,
    duration_minutes: initialData?.duration_minutes || 90,
    start_time: initialData?.start_time || '',
    end_time: initialData?.end_time || '',
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TryoutFormData>({
    defaultValues,
  })

  const onSubmit = async (data: TryoutFormData) => {
    setIsSubmitting(true)

    try {
      let result

      if (mode === 'edit' && tryoutId) {
        // Update existing tryout
        result = await updateTryout(tryoutId, {
          title: data.title,
          description: data.description,
          pricing_model: data.pricing_model,
          tryout_price: data.pricing_model === 'premium' ? data.tryout_price : 0,
          explanation_price: data.pricing_model === 'freemium' ? data.explanation_price : 0,
          has_explanation: data.has_explanation,
          is_global: role === 'admin' ? data.is_global : false,
          school_id: !data.is_global ? data.school_id : undefined,
          duration_minutes: data.duration_minutes,
          start_time: data.start_time || undefined,
          end_time: data.end_time || undefined,
        })
      } else {
        // Create new tryout
        result = await createTryout({
          title: data.title,
          description: data.description,
          pricing_model: data.pricing_model,
          tryout_price: data.pricing_model === 'premium' ? data.tryout_price : 0,
          explanation_price: data.pricing_model === 'freemium' ? data.explanation_price : 0,
          has_explanation: data.has_explanation,
          is_global: role === 'admin' ? data.is_global : false,
          school_id: !data.is_global ? data.school_id : undefined,
          duration_minutes: data.duration_minutes,
          start_time: data.start_time || undefined,
          end_time: data.end_time || undefined,
        })
      }

      if (result.success && result.data) {
        const basePath = role === 'admin' ? '/dashboard/admin' : '/dashboard/guru'
        
        if (mode === 'edit') {
          // Redirect back to tryout list after edit
          router.push(`${basePath}/tryouts`)
        } else {
          // Redirect to questions page after create
          router.push(`${basePath}/tryouts/${result.data.id}/questions`)
        }
        router.refresh()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Terjadi kesalahan saat menyimpan tryout')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Judul Tryout *</Label>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Judul harus diisi' }}
              render={({ field }) => (
                <>
                  <Input
                    id="title"
                    placeholder="Contoh: Tryout UTBK Saintek 2026"
                    {...field}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </>
              )}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  placeholder="Jelaskan tentang tryout ini..."
                  rows={4}
                  {...field}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Targeting (Admin only) */}
      {role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Jangkauan Tryout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              name="is_global"
              control={control}
              render={({ field: isGlobalField }) => (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_global">Tryout Global</Label>
                      <p className="text-sm text-muted-foreground">
                        Tryout dapat diakses oleh semua siswa
                      </p>
                    </div>
                    <Switch
                      id="is_global"
                      checked={isGlobalField.value}
                      onCheckedChange={isGlobalField.onChange}
                    />
                  </div>

                  {!isGlobalField.value && (
                    <Controller
                      name="school_id"
                      control={control}
                      rules={{ required: 'Pilih sekolah' }}
                      render={({ field: schoolField }) => (
                        <div className="space-y-2">
                          <Label htmlFor="school_id">Pilih Sekolah *</Label>
                          <Select
                            value={schoolField.value}
                            onValueChange={schoolField.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih sekolah" />
                            </SelectTrigger>
                            <SelectContent>
                              {schools.map((school) => (
                                <SelectItem key={school.id} value={school.id}>
                                  {school.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.school_id && (
                            <p className="text-sm text-red-600">
                              {errors.school_id.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  )}
                </>
              )}
            />
          </CardContent>
        </Card>
      )}

      {/* Pricing Model */}
      <Card>
        <CardHeader>
          <CardTitle>Model Harga</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            name="pricing_model"
            control={control}
            render={({ field: pricingField }) => (
              <>
                <RadioGroup
                  value={pricingField.value}
                  onValueChange={pricingField.onChange}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="pricing-free" />
                    <Label htmlFor="pricing-free">Gratis Total</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="freemium" id="pricing-freemium" />
                    <Label htmlFor="pricing-freemium">
                      Freemium (Tryout gratis, Pembahasan berbayar)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="premium" id="pricing-premium" />
                    <Label htmlFor="pricing-premium">
                      Premium (Tryout + Pembahasan berbayar)
                    </Label>
                  </div>
                </RadioGroup>

                {/* Freemium Price */}
                {pricingField.value === 'freemium' && (
                  <Controller
                    name="explanation_price"
                    control={control}
                    render={({ field: priceField }) => (
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="explanation_price">
                          Harga Pembahasan (Rp)
                        </Label>
                        <Input
                          id="explanation_price"
                          type="number"
                          min={0}
                          value={priceField.value}
                          onChange={(e) => priceField.onChange(parseInt(e.target.value) || 0)}
                        />
                        <div className="flex gap-2">
                          {[10000, 15000, 25000, 35000, 50000].map((price) => (
                            <Button
                              key={price}
                              type="button"
                              size="sm"
                              variant="outline"
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

                {/* Premium Price */}
                {pricingField.value === 'premium' && (
                  <Controller
                    name="tryout_price"
                    control={control}
                    render={({ field: priceField }) => (
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="tryout_price">
                          Harga Bundle (Tryout + Pembahasan)
                        </Label>
                        <Input
                          id="tryout_price"
                          type="number"
                          min={0}
                          value={priceField.value}
                          onChange={(e) => priceField.onChange(parseInt(e.target.value) || 0)}
                        />
                        <div className="flex gap-2">
                          {[15000, 25000, 35000, 50000, 75000, 100000].map((price) => (
                            <Button
                              key={price}
                              type="button"
                              size="sm"
                              variant="outline"
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
              </>
            )}
          />
        </CardContent>
      </Card>

      {/* Duration & Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Durasi & Jadwal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Durasi (menit) *</Label>
            <Controller
              name="duration_minutes"
              control={control}
              rules={{
                required: 'Durasi harus diisi',
                min: { value: 1, message: 'Minimal 1 menit' },
              }}
              render={({ field }) => (
                <>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                  {errors.duration_minutes && (
                    <p className="text-sm text-red-600">
                      {errors.duration_minutes.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="start_time">Mulai (opsional)</Label>
            <Controller
              name="start_time"
              control={control}
              render={({ field }) => (
                <Input id="start_time" type="datetime-local" {...field} />
              )}
            />
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label htmlFor="end_time">Selesai (opsional)</Label>
            <Controller
              name="end_time"
              control={control}
              render={({ field }) => (
                <Input id="end_time" type="datetime-local" {...field} />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
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
          {isSubmitting
            ? mode === 'edit'
              ? 'Menyimpan...'
              : 'Membuat...'
            : mode === 'edit'
              ? 'Simpan Perubahan'
              : 'Buat Tryout'}
        </Button>
      </div>
    </form>
  )
}