import type {
  PresentabilityAdminAction,
  PresentabilityAdminRecord,
  PresentabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePresentabilityDomainInventory = {
  domain: PresentabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPresentabilityAdminRecords(
  inventory: WorkspacePresentabilityDomainInventory[],
): PresentabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPresentabilityAdminStats(input: {
  records: PresentabilityAdminRecord[]
  postgresConnectivity: boolean
}): PresentabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'usage_events')
      ?.recordCount ?? 0
  const presentabilityPercent =
    completedRuns === 0
      ? 100
      : Math.min(100, Math.round((metricRecords / completedRuns) * 100))

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    presentabilityPercent,
  }
}

export function getPresentabilityAdminGuidance(input: {
  stats: PresentabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect presentability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial presentability coverage and refresh the presentability summary.'
  }

  if (input.stats.presentabilityPercent < 95) {
    return 'Workspace owners and admins can inspect usage event presentability below the 95% target and refresh the presentability summary.'
  }

  return 'Workspace owners and admins can inspect workspace presentability coverage and refresh the presentability summary.'
}

export function resolvePresentabilityAdminActions(): PresentabilityAdminAction[] {
  return ['refresh_presentability_summary']
}
