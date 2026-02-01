'use client'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'

interface MobileSidebarProps {
  role: 'admin' | 'guru' | 'siswa'
  open: boolean
  onClose: () => void
}

/**
 * Mobile Sidebar Component
 * Controlled sheet component for mobile navigation
 */
export function MobileSidebar({ role, open, onClose }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0">
        <div className="pt-4">
          <Sidebar role={role} />
        </div>
      </SheetContent>
    </Sheet>
  )
}