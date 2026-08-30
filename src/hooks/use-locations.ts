import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '@/api/api-error'
import {
  locationsApi,
  type CreateLocationPayload,
  type UpdateLocationPayload,
} from '@/api/endpoints/locations'
import { queryKeys } from '@/lib/query-keys'

export function useLocations() {
  return useQuery({
    queryKey: queryKeys.locations.list(),
    queryFn: locationsApi.list,
  })
}

export function useLocation(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.locations.detail(id ?? ''),
    queryFn: () => locationsApi.get(id!),
    enabled: !!id,
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateLocationPayload) => locationsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations.all() })
      toast.success('Location created.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not create this location.')
    },
  })
}

export function useUpdateLocation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateLocationPayload) => locationsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations.all() })
      toast.success('Location updated.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not update this location.')
    },
  })
}

export function useAssignManager() {
  return useMutation({
    mutationFn: ({ locationId, managerId }: { locationId: string; managerId: string }) =>
      locationsApi.assignManager(locationId, managerId),
    onSuccess: () => {
      toast.success('Manager assigned.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not assign this manager.')
    },
  })
}
