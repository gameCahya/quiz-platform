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
  schoolId: string
  educationLevelId?: string
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  multiple?: boolean
}

export function ClassSelector({ 
  schoolId,
  educationLevelId,
  value, 
  onChange, 
  disabled 
}: ClassSelectorProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchClasses() {
      if (!schoolId) {
        setClasses([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const supabase = createClient()
      
      let query = supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId)

      if (educationLevelId) {
        query = query.eq('education_level_id', educationLevelId)
      }

      const { data, error } = await query.order('grade').order('section')

      if (!error && data) {
        setClasses(data)
      }
      setIsLoading(false)
    }

    fetchClasses()
  }, [schoolId, educationLevelId])

  return (
    <Select 
      value={value} 
      onValueChange={onChange} 
      disabled={disabled || isLoading || !schoolId}
    >
      <SelectTrigger>
        <SelectValue 
          placeholder={
            !schoolId 
              ? 'Pilih sekolah dulu' 
              : isLoading 
              ? 'Loading...' 
              : 'Pilih kelas'
          } 
        />
      </SelectTrigger>
      <SelectContent>
        {classes.map((cls) => (
          <SelectItem key={cls.id} value={cls.id}>
            {cls.full_name} ({cls.student_count} siswa)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
