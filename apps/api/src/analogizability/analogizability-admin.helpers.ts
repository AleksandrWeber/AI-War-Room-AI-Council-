import type {
  AnalogizabilityAdminAction,
  AnalogizabilityAdminRecord,
  AnalogizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAnalogizabilityDomainInventory = {
  domain: AnalogizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAnalogizabilityAdminRecords(
  inventory: WorkspaceAnalogizabilityDomainInventory[],
): AnalogizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAnalogizabilityAdminStats(input: {
  records: AnalogizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AnalogizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'usage_events')
      ?.recordCount ?? 0
  const analogizabilityPercent =
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
    analogizabilityPercent,
  }
}

export function getAnalogizabilityAdminGuidance(input: {
  stats: AnalogizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect analogizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial analogizability coverage and refresh the analogizability summary.'
  }

  if (input.stats.analogizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect usage event analogizability below the 95% target and refresh the analogizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace analogizability coverage and refresh the analogizability summary.'
}

export function resolveAnalogizabilityAdminActions(): AnalogizabilityAdminAction[] {
  return ['refresh_analogizability_summary']
}
