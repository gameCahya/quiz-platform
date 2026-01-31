'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

/**
 * Sidebar Logout Button
 * Placed at the bottom of the sidebar
 */
export function SidebarLogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="border-t p-4">
      <Button
        onClick={handleLogout}
        disabled={isLoading}
        variant="ghost"
        className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <LogOut className="h-5 w-5" />
        <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
      </Button>
    </div>
  )
}

// Example Sidebar component with logout at bottom
export function SidebarWithLogout({ }: { role: 'admin' | 'guru' | 'siswa' }) {
  return (
    <div className="flex h-full flex-col">
      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 p-4">
        {/* Your existing sidebar menu items here */}
        <div className="space-y-1">
          <a
            href="/dashboard/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100"
          >
            <span>Dashboard</span>
          </a>
          {/* Add more menu items */}
        </div>
      </nav>

      {/* Logout Button - Fixed at Bottom */}
      <SidebarLogoutButton />
    </div>
  )
}