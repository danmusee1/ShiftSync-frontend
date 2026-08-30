import { useQuery } from '@tanstack/react-query'

import { usersApi } from '@/api/endpoints/users'
import { queryKeys } from '@/lib/query-keys'
import type { Role } from '@/types/domain'

export function useUsers(role?: Role) {
  return useQuery({
    queryKey: queryKeys.users.list(role),
    queryFn: () => usersApi.list(role),
  })
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? ''),
    queryFn: () => usersApi.get(id!),
    enabled: !!id,
  })
}
