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
      {/* Header - fixed at top */}
      <Header
        user={user}
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar - fixed on left */}
        <aside className="hidden w-64 border-r bg-white lg:block">
          <Sidebar role={user.role} />
        </aside>

        {/* Mobile Sidebar - sheet overlay */}
        <MobileSidebar
          role={user.role}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}