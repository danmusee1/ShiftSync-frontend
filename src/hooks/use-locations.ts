import { useQuery } from '@tanstack/react-query'

import { locationsApi } from '@/api/endpoints/locations'
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
