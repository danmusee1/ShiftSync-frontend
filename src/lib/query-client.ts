import { QueryClient } from '@tanstack/react-query'

import { ApiError } from '@/api/api-error'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Don't retry client errors (bad request, forbidden, not found, etc.)
        // — retrying a 4xx just delays the inevitable and re-triggers side effects.
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false
        }
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})
