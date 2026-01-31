'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileSidebar } from '@/components/layout/MobileSidebar'

type DashboardLayoutProps = {
  children: React.ReactNode
  user: {
    id: string
    name: string
    email: string
    role: 'admin' | 'guru' | 'siswa'
  }
}

/**
 * Main dashboard layout wrapper
 * Includes Header, Sidebar, and main content area
 * Handles mobile sidebar state
 */
export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - with logout button */}
      <Header
        user={user}
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:mt-16 lg:flex lg:w-64 lg:flex-col">
          <Sidebar role={user.role} />
        </aside>

        {/* Mobile Sidebar */}
        <MobileSidebar
          role={user.role}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}