import { apiClient } from '@/api/client'
import type { Skill } from '@/types/domain'

export const skillsApi = {
  list: () => apiClient.get<Skill[]>('/skills').then((res) => res.data),
  create: (name: string) => apiClient.post<Skill>('/skills', { name }).then((res) => res.data),
}
