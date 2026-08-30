import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '@/api/api-error'
import { auditApi, type AuditExportFilter } from '@/api/endpoints/audit'
import { queryKeys } from '@/lib/query-keys'
import type { AuditEntityType } from '@/types/domain'

export function useAuditForEntity(entityType: AuditEntityType, entityId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.audit.entity(entityType, entityId ?? ''),
    queryFn: () => auditApi.findForEntity(entityType, entityId!),
    enabled: !!entityId,
  })
}

export function useExportAuditLog() {
  return useMutation({
    mutationFn: (filter: AuditExportFilter) => auditApi.export(filter),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'audit-log.xlsx'
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Audit log downloaded.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not export the audit log.')
    },
  })
}
