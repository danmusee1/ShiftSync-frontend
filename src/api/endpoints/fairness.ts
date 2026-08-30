import { apiClient } from '@/api/client'
import type { DesiredHoursEntry, HoursDistributionEntry, PremiumFairnessEntry } from '@/types/domain'

export const fairnessApi = {
  getHoursDistribution: (from: string, to: string, locationId?: string) =>
    apiClient
      .get<HoursDistributionEntry[]>('/fairness/hours-distribution', { params: { from, to, locationId } })
      .then((res) => res.data),

  getPremiumShiftFairness: (from: string, to: string, locationId?: string) =>
    apiClient
      .get<PremiumFairnessEntry[]>('/fairness/premium-shifts', { params: { from, to, locationId } })
      .then((res) => res.data),

  getDesiredHoursComparison: (weekStartDate: string, locationId?: string) =>
    apiClient
      .get<DesiredHoursEntry[]>('/fairness/desired-hours', { params: { weekStartDate, locationId } })
      .then((res) => res.data),
}
