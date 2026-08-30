import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '@/api/api-error'
import { skillsApi } from '@/api/endpoints/skills'
import { queryKeys } from '@/lib/query-keys'

export function useSkills() {
  return useQuery({
    queryKey: queryKeys.skills.list(),
    queryFn: skillsApi.list,
  })
}

export function useCreateSkill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => skillsApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.list() })
      toast.success('Skill added.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not add this skill.')
    },
  })
}
