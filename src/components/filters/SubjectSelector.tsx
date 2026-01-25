// src/components/filters/SubjectSelector.tsx
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
import type { Subject } from '@/types/database'

interface SubjectSelectorProps {
  educationLevelId?: string
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function SubjectSelector({ 
  educationLevelId,
  value, 
  onChange, 
  disabled 
}: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSubjects() {
      if (!educationLevelId) {
        setSubjects([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('education_level_id', educationLevelId)
        .order('name')

      if (!error && data) {
        setSubjects(data)
      }
      setIsLoading(false)
    }

    fetchSubjects()
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
              ? 'Pilih tingkat dulu' 
              : isLoading 
              ? 'Loading...' 
              : 'Pilih mata pelajaran'
          } 
        />
      </SelectTrigger>
      <SelectContent>
        {subjects.map((subject) => (
          <SelectItem key={subject.id} value={subject.id}>
            {subject.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
