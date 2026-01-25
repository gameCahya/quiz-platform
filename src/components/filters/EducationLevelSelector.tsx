// src/components/filters/EducationLevelSelector.tsx
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
import type { EducationLevel } from '@/types/database'

interface EducationLevelSelectorProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function EducationLevelSelector({ 
  value, 
  onChange, 
  disabled 
}: EducationLevelSelectorProps) {
  const [levels, setLevels] = useState<EducationLevel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLevels() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('education_levels')
        .select('*')
        .order('name')

      if (!error && data) {
        setLevels(data)
      }
      setIsLoading(false)
    }

    fetchLevels()
  }, [])

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading...' : 'Pilih tingkat'} />
      </SelectTrigger>
      <SelectContent>
        {levels.map((level) => (
          <SelectItem key={level.id} value={level.id}>
            {level.name} (Kelas {level.grades.join(', ')})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
