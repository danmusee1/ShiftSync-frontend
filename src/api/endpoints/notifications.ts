import { apiClient } from '@/api/client'
import type { Notification } from '@/types/domain'

export const notificationsApi = {
  list: (unreadOnly?: boolean) =>
    apiClient
      .get<Notification[]>('/notifications', { params: unreadOnly ? { unreadOnly: 'true' } : undefined })
      .then((res) => res.data),

  markRead: (id: string) =>
    apiClient.patch<Notification>(`/notifications/${id}/read`).then((res) => res.data),

  markAllRead: () => apiClient.patch<void>('/notifications/read-all').then((res) => res.data),
}
