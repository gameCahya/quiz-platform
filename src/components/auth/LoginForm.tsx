'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    console.log('🔐 Attempting login for:', data.email)

    try {
      const result = await login(data)
      
      console.log('📥 Login result:', result)
      
      if (result?.error) {
        console.error('❌ Login failed:', result.error)
        setError(result.error)
        setIsLoading(false)
        return
      }
      
      if (result?.success && result?.redirectTo) {
        console.log('✅ Login successful, redirecting to:', result.redirectTo)
        router.push(result.redirectTo)
        router.refresh()
      } else {
        console.error('❌ Unexpected response:', result)
        setError('Login completed but redirect failed')
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
          placeholder="••••••••"
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link href="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </form>
  )
}
