import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  availabilityApi,
  type CreateAvailabilityExceptionPayload,
  type CreateAvailabilityRulePayload,
  type UpdateAvailabilityRulePayload,
} from '@/api/endpoints/availability'
import { ApiError } from '@/api/api-error'
import { queryKeys } from '@/lib/query-keys'

export function useAvailabilityRules(staffId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.staff.availabilityRules(staffId ?? ''),
    queryFn: () => availabilityApi.listRules(staffId!),
    enabled: !!staffId,
  })
}

export function useCreateAvailabilityRule(staffId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAvailabilityRulePayload) =>
      availabilityApi.createRule(staffId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.availabilityRules(staffId) })
      toast.success('Availability rule added.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not add this rule.')
    },
  })
}

export function useUpdateAvailabilityRule(staffId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ruleId, payload }: { ruleId: string; payload: UpdateAvailabilityRulePayload }) =>
      availabilityApi.updateRule(staffId, ruleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.availabilityRules(staffId) })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not update this rule.')
    },
  })
}

export function useDeleteAvailabilityRule(staffId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ruleId: string) => availabilityApi.deleteRule(staffId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.availabilityRules(staffId) })
      toast.success('Availability rule removed.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not remove this rule.')
    },
  })
}

export function useAvailabilityExceptions(staffId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.staff.availabilityExceptions(staffId ?? ''),
    queryFn: () => availabilityApi.listExceptions(staffId!),
    enabled: !!staffId,
  })
}

export function useCreateAvailabilityException(staffId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAvailabilityExceptionPayload) =>
      availabilityApi.createException(staffId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.availabilityExceptions(staffId) })
      toast.success('Exception added.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not add this exception.')
    },
  })
}

export function useDeleteAvailabilityException(staffId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (exceptionId: string) => availabilityApi.deleteException(staffId, exceptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.availabilityExceptions(staffId) })
      toast.success('Exception removed.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not remove this exception.')
    },
  })
}
