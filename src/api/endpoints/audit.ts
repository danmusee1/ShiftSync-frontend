import { apiClient } from '@/api/client'
import type { AuditEntityType, AuditLog } from '@/types/domain'

export interface AuditExportFilter {
  locationId?: string
  from?: string
  to?: string
}

export const auditApi = {
  findForEntity: (entityType: AuditEntityType, entityId: string) =>
    apiClient
      .get<AuditLog[]>(`/audit/entities/${entityType}/${entityId}`)
      .then((res) => res.data),

  export: (filter: AuditExportFilter) =>
    apiClient
      .get('/audit/export', { params: filter, responseType: 'blob' })
      .then((res) => res.data as Blob),
}
