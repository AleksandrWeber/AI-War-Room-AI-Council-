import type {
  AdoptabilityAdminAction,
  AdoptabilityAdminRecord,
  AdoptabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAdoptabilityDomainInventory = {
  domain: AdoptabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAdoptabilityAdminRecords(
  inventory: WorkspaceAdoptabilityDomainInventory[],
): AdoptabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAdoptabilityAdminStats(input: {
  records: AdoptabilityAdminRecord[]
  postgresConnectivity: boolean
}): AdoptabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'usage_events')
      ?.recordCount ?? 0
  const adoptabilityPercent =
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
    adoptabilityPercent,
  }
}

export function getAdoptabilityAdminGuidance(input: {
  stats: AdoptabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect adoptability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial adoptability coverage and refresh the adoptability summary.'
  }

  if (input.stats.adoptabilityPercent < 95) {
    return 'Workspace owners and admins can inspect usage event adoptability below the 95% target and refresh the adoptability summary.'
  }

  return 'Workspace owners and admins can inspect workspace adoptability coverage and refresh the adoptability summary.'
}

export function resolveAdoptabilityAdminActions(): AdoptabilityAdminAction[] {
  return ['refresh_adoptability_summary']
}
