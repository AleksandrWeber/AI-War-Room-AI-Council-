import type {
  TunabilityAdminAction,
  TunabilityAdminRecord,
  TunabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTunabilityDomainInventory = {
  domain: TunabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTunabilityAdminRecords(
  inventory: WorkspaceTunabilityDomainInventory[],
): TunabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTunabilityAdminStats(input: {
  records: TunabilityAdminRecord[]
  postgresConnectivity: boolean
}): TunabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'usage_events')
      ?.recordCount ?? 0
  const tunabilityPercent =
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
    tunabilityPercent,
  }
}

export function getTunabilityAdminGuidance(input: {
  stats: TunabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect tunability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial tunability coverage and refresh the tunability summary.'
  }

  if (input.stats.tunabilityPercent < 95) {
    return 'Workspace owners and admins can inspect usage event tunability below the 95% target and refresh the tunability summary.'
  }

  return 'Workspace owners and admins can inspect workspace tunability coverage and refresh the tunability summary.'
}

export function resolveTunabilityAdminActions(): TunabilityAdminAction[] {
  return ['refresh_tunability_summary']
}
