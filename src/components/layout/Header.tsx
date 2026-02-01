import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserDropdown } from '@/components/layout/UserDropdown'

type HeaderProps = {
  user: {
    name: string
    email: string
    role: 'admin' | 'guru' | 'siswa'
  }
  onToggleSidebar?: () => void
}

/**
 * Dashboard Header Component
 * Displays at the top of all dashboard pages
 * Includes mobile menu toggle and user dropdown with logout
 */
export function Header({ user, onToggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left side: Mobile menu toggle + Logo/Title */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-purple-600">
              <span className="text-lg font-bold text-white">Q</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">Quiz Platform</h1>
            </div>
          </div>
        </div>

        {/* Right side: User dropdown */}
        <div className="flex items-center gap-4">
          {/* You can add notification bell, search, etc here */}
          
          {/* User Dropdown with Logout */}
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  )
}