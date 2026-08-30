import { useEffect } from 'react'
import { toast } from 'sonner'

import { queryClient } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { connectSocket, disconnectSocket } from '@/lib/socket'
import { useAuthStore } from '@/stores/auth-store'
import type { Notification, ScheduleWeek } from '@/types/domain'

/**
 * One socket connection per authenticated session, wired directly into the
 * TanStack Query cache: each backend event invalidates (or patches) exactly
 * the queries a REST call would have. Mounted once, from AppShell, so it
 * covers every authenticated route.
 */
export function useRealtime() {
  const accessToken = useAuthStore((state) => state.accessToken)

  useEffect(() => {
    if (!accessToken) return

    const socket = connectSocket(accessToken)

    function onNotificationNew(notification: Notification) {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })
      toast.message(notification.title, { description: notification.body })
    }

    function onSchedulePublishChange(week: ScheduleWeek) {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleWeeks.detail(week.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleWeeks.byLocation(week.locationId) })
    }

    function onDutyUpdate(payload: { locationId: string }) {
      queryClient.invalidateQueries({ queryKey: queryKeys.onDuty.byLocation(payload.locationId) })
    }

    socket.on('notification.new', onNotificationNew)
    socket.on('schedule.published', onSchedulePublishChange)
    socket.on('schedule.unpublished', onSchedulePublishChange)
    socket.on('onduty.update', onDutyUpdate)

    return () => {
      socket.off('notification.new', onNotificationNew)
      socket.off('schedule.published', onSchedulePublishChange)
      socket.off('schedule.unpublished', onSchedulePublishChange)
      socket.off('onduty.update', onDutyUpdate)
    }
  }, [accessToken])

  useEffect(() => {
    if (!accessToken) disconnectSocket()
  }, [accessToken])
}
