import type {
  HermeticizabilityAdminAction,
  HermeticizabilityAdminRecord,
  HermeticizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceHermeticizabilityDomainInventory = {
  domain: HermeticizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildHermeticizabilityAdminRecords(
  inventory: WorkspaceHermeticizabilityDomainInventory[],
): HermeticizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildHermeticizabilityAdminStats(input: {
  records: HermeticizabilityAdminRecord[]
  postgresConnectivity: boolean
}): HermeticizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const hermeticizabilityPercent =
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
    hermeticizabilityPercent,
  }
}

export function getHermeticizabilityAdminGuidance(input: {
  stats: HermeticizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect hermeticizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial hermeticizability coverage and refresh the hermeticizability summary.'
  }

  if (input.stats.hermeticizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health hermeticizability below the 95% target and refresh the hermeticizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace hermeticizability coverage and refresh the hermeticizability summary.'
}

export function resolveHermeticizabilityAdminActions(): HermeticizabilityAdminAction[] {
  return ['refresh_hermeticizability_summary']
}
