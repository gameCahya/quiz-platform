'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type UserDropdownProps = {
  user: {
    name: string
    email: string
    role: 'admin' | 'guru' | 'siswa'
  }
}

/**
 * User dropdown menu with logout functionality
 * Displays in the Header component
 */
export function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'guru':
        return 'bg-blue-100 text-blue-800'
      case 'siswa':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get role label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator'
      case 'guru':
        return 'Guru'
      case 'siswa':
        return 'Siswa'
      default:
        return role
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout()
      // Redirect will be handled by server action
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 gap-2 px-2 hover:bg-gray-100"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex md:flex-col md:items-start">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-gray-500">{getRoleLabel(user.role)}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-gray-500">{user.email}</p>
            <span
              className={`mt-2 inline-flex w-fit items-center rounded-full px-2 py-1 text-xs font-medium ${getRoleBadgeColor(
                user.role
              )}`}
            >
              {getRoleLabel(user.role)}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push('/profile')}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push('/settings')}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoading}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}