'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
  FileText,
  Clock,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TryoutWithCreator } from '@/types/tryout'
import { deleteTryout, duplicateTryout } from '@/app/actions/tryout'
import { useRouter } from 'next/navigation'

type TryoutListProps = {
  tryouts: TryoutWithCreator[]
  role: 'admin' | 'guru'
}

export function TryoutList({ tryouts, role }: TryoutListProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [pricingFilter, setPricingFilter] = useState('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tryoutToDelete, setTryoutToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter tryouts
  const filteredTryouts = tryouts.filter((tryout) => {
    const matchesSearch = tryout.title.toLowerCase().includes(search.toLowerCase())
    const matchesPricing =
      pricingFilter === 'all' || tryout.pricing_model === pricingFilter

    return matchesSearch && matchesPricing
  })

  // Handle delete
  const handleDelete = async () => {
    if (!tryoutToDelete) return

    setIsDeleting(true)
    const result = await deleteTryout(tryoutToDelete)

    if (result.success) {
      setDeleteDialogOpen(false)
      setTryoutToDelete(null)
      router.refresh()
    } else {
      alert(`Error: ${result.error}`)
    }
    setIsDeleting(false)
  }

  // Handle duplicate
  const handleDuplicate = async (id: string) => {
    const result = await duplicateTryout(id)

    if (result.success) {
      router.refresh()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  // Get pricing badge
  const getPricingBadge = (tryout: TryoutWithCreator) => {
    switch (tryout.pricing_model) {
      case 'free':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            GRATIS
          </Badge>
        )
      case 'freemium':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            FREEMIUM
          </Badge>
        )
      case 'premium':
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            PREMIUM
          </Badge>
        )
    }
  }

  // Get global badge
  const getGlobalBadge = (isGlobal: boolean) => {
    if (isGlobal) {
      return <Badge variant="default">GLOBAL</Badge>
    }
    return <Badge variant="outline">SEKOLAH</Badge>
  }

  if (tryouts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium">Belum ada tryout</h3>
          <p className="mb-4 text-center text-sm text-gray-500">
            Mulai dengan membuat tryout pertama Anda
          </p>
          <Link href={`/dashboard/${role}/tryouts/create`}>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Buat Tryout
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {/* Search */}
            <Input
              placeholder="Cari tryout..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />

            {/* Pricing Filter */}
            <Select value={pricingFilter} onValueChange={setPricingFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Model Harga" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="free">Gratis</SelectItem>
                <SelectItem value="freemium">Freemium</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="text-sm text-gray-600">
        Menampilkan {filteredTryouts.length} dari {tryouts.length} tryout
      </div>

      {/* Tryout Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTryouts.map((tryout) => (
          <Card key={tryout.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getPricingBadge(tryout)}
                    {getGlobalBadge(tryout.is_global)}
                  </div>
                  <CardTitle className="mt-2 line-clamp-2">{tryout.title}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {tryout.description || 'Tidak ada deskripsi'}
                  </CardDescription>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/${role}/tryouts/${tryout.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/${role}/tryouts/${tryout.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(tryout.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplikat
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => {
                        setTryoutToDelete(tryout.id)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              {/* Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>0 soal</span>
                </div>

                {tryout.duration_minutes && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{tryout.duration_minutes} menit</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>0 pengerjaan</span>
                </div>

                {tryout.creator && (
                  <div className="text-xs text-gray-500">
                    Dibuat oleh: {tryout.creator.name}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(tryout.created_at), {
                    addSuffix: true,
                    locale: idLocale,
                  })}
                </div>
              </div>

              {/* Price Info */}
              {tryout.pricing_model === 'freemium' && (
                <div className="mt-4 rounded-lg bg-blue-50 p-3">
                  <p className="text-xs text-blue-600">
                    Pembahasan: Rp {tryout.explanation_price.toLocaleString('id-ID')}
                  </p>
                </div>
              )}

              {tryout.pricing_model === 'premium' && (
                <div className="mt-4 rounded-lg bg-purple-50 p-3">
                  <p className="text-xs text-purple-600">
                    Harga: Rp {tryout.tryout_price.toLocaleString('id-ID')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tryout?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Tryout dan semua soal di dalamnya akan
              dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}