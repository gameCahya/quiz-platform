// src/components/filters/SchoolSelector.tsx
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
import type { School } from '@/types/database'

interface SchoolSelectorProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function SchoolSelector({ value, onChange, disabled }: SchoolSelectorProps) {
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSchools() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name')

      if (!error && data) {
        setSchools(data)
      }
      setIsLoading(false)
    }

    fetchSchools()
  }, [])

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading...' : 'Pilih sekolah'} />
      </SelectTrigger>
      <SelectContent>
        {schools.map((school) => (
          <SelectItem key={school.id} value={school.id}>
            {school.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
