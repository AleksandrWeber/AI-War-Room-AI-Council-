import type {
  TolerizabilityAdminAction,
  TolerizabilityAdminRecord,
  TolerizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTolerizabilityDomainInventory = {
  domain: TolerizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTolerizabilityAdminRecords(
  inventory: WorkspaceTolerizabilityDomainInventory[],
): TolerizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTolerizabilityAdminStats(input: {
  records: TolerizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TolerizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const tolerizabilityPercent =
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
    tolerizabilityPercent,
  }
}

export function getTolerizabilityAdminGuidance(input: {
  stats: TolerizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect tolerizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial tolerizability coverage and refresh the tolerizability summary.'
  }

  if (input.stats.tolerizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification tolerizability below the 95% target and refresh the tolerizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace tolerizability coverage and refresh the tolerizability summary.'
}

export function resolveTolerizabilityAdminActions(): TolerizabilityAdminAction[] {
  return ['refresh_tolerizability_summary']
}
