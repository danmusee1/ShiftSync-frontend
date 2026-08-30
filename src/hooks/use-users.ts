import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '@/api/api-error'
import { usersApi, type CreateUserPayload, type UpdateUserPayload } from '@/api/endpoints/users'
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

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
      toast.success('User created.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not create this user.')
    },
  })
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
      toast.success('User updated.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not update this user.')
    },
  })
}

export function useSetUserActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? usersApi.activate(id) : usersApi.deactivate(id),
    onSuccess: (_data, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
      toast.success(isActive ? 'User activated.' : 'User deactivated.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not update this user.')
    },
  })
}
