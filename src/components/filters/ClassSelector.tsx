// src/components/filters/ClassSelector.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Class } from '@/types/database'

interface ClassSelectorProps {
  educationLevelId?: string
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ClassSelector({
  educationLevelId,
  value,
  onChange,
  disabled
}: ClassSelectorProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchClasses() {
      if (!educationLevelId) {
        setClasses([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('education_level_id', educationLevelId)
        .order('name')

      if (!error && data) {
        setClasses(data)
      }
      setIsLoading(false)
    }

    fetchClasses()
  }, [educationLevelId])

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled || isLoading || !educationLevelId}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={
            !educationLevelId
              ? 'Pilih tingkat pendidikan dulu'
              : isLoading
                ? 'Loading...'
                : 'Pilih kelas'
          }
        />
      </SelectTrigger>
      <SelectContent>
        {classes.map((cls) => (
          <SelectItem key={cls.id} value={cls.id}>
            {cls.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
