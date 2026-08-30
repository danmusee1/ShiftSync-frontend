import { useQuery } from '@tanstack/react-query'

import { skillsApi } from '@/api/endpoints/skills'
import { queryKeys } from '@/lib/query-keys'

export function useSkills() {
  return useQuery({
    queryKey: queryKeys.skills.list(),
    queryFn: skillsApi.list,
  })
}
