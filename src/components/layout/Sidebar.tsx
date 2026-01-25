// components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Users,
  School,
  Trophy,
  Settings,
  BookOpen,
  ClipboardList,
  PlusCircle,
  BarChart3,
  GraduationCap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SidebarProps {
  role: 'admin' | 'guru' | 'siswa'
}

interface MenuItem {
  icon: any
  label: string
  href: string
  badge?: string
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const adminMenu: MenuItem[] = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '/dashboard/admin' 
    },
    { 
      icon: FileText, 
      label: 'Kelola Tryout', 
      href: '/dashboard/admin/tryouts',
      badge: 'New'
    },
    { 
      icon: Users, 
      label: 'Kelola Users', 
      href: '/dashboard/admin/users' 
    },
    { 
      icon: School, 
      label: 'Kelola Sekolah', 
      href: '/dashboard/admin/schools' 
    },
    { 
      icon: GraduationCap, 
      label: 'Kelola Kelas', 
      href: '/dashboard/admin/classes' 
    },
    { 
      icon: Trophy, 
      label: 'Leaderboard', 
      href: '/dashboard/admin/leaderboard' 
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      href: '/dashboard/admin/analytics' 
    },
    { 
      icon: Settings, 
      label: 'Pengaturan', 
      href: '/dashboard/admin/settings' 
    },
  ]

  const guruMenu: MenuItem[] = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '/dashboard/guru' 
    },
    { 
      icon: FileText, 
      label: 'Tryout Saya', 
      href: '/dashboard/guru/tryouts' 
    },
    { 
      icon: PlusCircle, 
      label: 'Buat Tryout', 
      href: '/dashboard/guru/tryouts/create',
      badge: 'New'
    },
    { 
      icon: Users, 
      label: 'Daftar Siswa', 
      href: '/dashboard/guru/students' 
    },
    { 
      icon: ClipboardList, 
      label: 'Hasil Tryout', 
      href: '/dashboard/guru/results' 
    },
    { 
      icon: Trophy, 
      label: 'Leaderboard', 
      href: '/dashboard/guru/leaderboard' 
    },
    { 
      icon: Settings, 
      label: 'Pengaturan', 
      href: '/dashboard/guru/settings' 
    },
  ]

  const siswaMenu: MenuItem[] = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '/dashboard/siswa' 
    },
    { 
      icon: BookOpen, 
      label: 'Tryout Tersedia', 
      href: '/dashboard/siswa/tryouts',
      badge: '5'
    },
    { 
      icon: ClipboardList, 
      label: 'Riwayat Saya', 
      href: '/dashboard/siswa/history' 
    },
    { 
      icon: Trophy, 
      label: 'Leaderboard', 
      href: '/dashboard/siswa/leaderboard' 
    },
    { 
      icon: Settings, 
      label: 'Pengaturan', 
      href: '/dashboard/siswa/settings' 
    },
  ]

  const menu = role === 'admin' ? adminMenu : role === 'guru' ? guruMenu : siswaMenu

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:pt-[73px] bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <div className="flex items-center">
                  <Icon className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                  )} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge 
                    variant={isActive ? "default" : "secondary"} 
                    className="ml-auto text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Quiz Platform v1.0
          </div>
        </div>
      </div>
    </aside>
  )
}
