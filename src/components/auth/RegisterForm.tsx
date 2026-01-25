'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<'admin' | 'guru' | 'siswa'>('siswa')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      role: role,
      school_id: formData.get('school_id') as string || undefined,
      education_level_id: formData.get('education_level_id') as string || undefined,
      class_id: formData.get('class_id') as string || undefined,
    }

    console.log('📤 Submitting registration:', { ...data, password: '***' })

    try {
      const result = await register(data)
      
      console.log('📥 Registration result:', result)
      
      if (result?.error) {
        console.error('❌ Registration failed:', result.error)
        setError(result.error)
        setIsLoading(false)
        return
      }
      
      if (result?.success && result?.redirectTo) {
        console.log('✅ Registration successful, redirecting to:', result.redirectTo)
        router.push(result.redirectTo)
        router.refresh()
      } else {
        console.error('❌ Unexpected response:', result)
        setError('Registration completed but redirect failed')
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error('❌ Unexpected error:', err)
      setError(err.message || 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200">
          <p className="text-sm text-red-800 font-medium">Error:</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="John Doe"
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="role">Role</Label>
        <Select 
          value={role} 
          onValueChange={(value: any) => setRole(value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="guru">Guru</SelectItem>
            <SelectItem value="siswa">Siswa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Register'}
      </Button>
    </form>
  )
}
