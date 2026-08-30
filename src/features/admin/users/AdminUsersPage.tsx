import { useState } from 'react'
import { IdCard, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { roleLabel } from '@/lib/format'
import { useSetUserActive, useUsers } from '@/hooks/use-users'
import type { Role, User } from '@/types/domain'
import { CertificationsDialog } from './CertificationsDialog'
import { CreateUserDialog } from './CreateUserDialog'
import { EditUserDialog } from './EditUserDialog'

const ROLE_FILTERS: Array<{ value: Role | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All roles' },
  { value: 'ADMIN', label: 'Admins' },
  { value: 'MANAGER', label: 'Managers' },
  { value: 'STAFF', label: 'Staff' },
]

export function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL')
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [certTarget, setCertTarget] = useState<User | null>(null)

  const users = useUsers(roleFilter === 'ALL' ? undefined : roleFilter)
  const setActive = useSetUserActive()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Everyone with access to ShiftSync.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New user
        </Button>
      </div>

      <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | 'ALL')}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLE_FILTERS.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {users.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.data?.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 py-2 font-medium">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{user.email}</td>
                  <td className="px-3 py-2">{roleLabel(user.role)}</td>
                  <td className="px-3 py-2">
                    <Badge variant={user.isActive ? 'success' : 'outline'}>
                      {user.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1.5">
                      {user.role === 'STAFF' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setCertTarget(user)}
                        >
                          <IdCard className="size-3.5" />
                          Certifications
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditTarget(user)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setActive.mutate({ id: user.id, isActive: !user.isActive })}
                        disabled={setActive.isPending}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditUserDialog user={editTarget} onOpenChange={(open) => !open && setEditTarget(null)} />
      <CertificationsDialog staff={certTarget} onOpenChange={(open) => !open && setCertTarget(null)} />
    </div>
  )
}
