import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '@/api/api-error'
import { certificationsApi } from '@/api/endpoints/certifications'
import { queryKeys } from '@/lib/query-keys'

export function useStaffSkills(staffId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.staff.skills(staffId ?? ''),
    queryFn: () => certificationsApi.listSkills(staffId!),
    enabled: !!staffId,
  })
}

export function useGrantSkill(staffId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (skillId: string) => certificationsApi.grantSkill(staffId, skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.skills(staffId) })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not grant this skill.')
    },
  })
}

export function useRevokeSkill(staffId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (skillId: string) => certificationsApi.revokeSkill(staffId, skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.skills(staffId) })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not revoke this skill.')
    },
  })
}

export function useStaffLocations(staffId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.staff.locations(staffId ?? ''),
    queryFn: () => certificationsApi.listLocations(staffId!),
    enabled: !!staffId,
  })
}

export function useCertifyLocation(staffId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (locationId: string) => certificationsApi.certifyLocation(staffId, locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.locations(staffId) })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not certify this location.')
    },
  })
}

export function useDecertifyLocation(staffId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (locationId: string) => certificationsApi.decertifyLocation(staffId, locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.locations(staffId) })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not decertify this location.')
    },
  })
}
