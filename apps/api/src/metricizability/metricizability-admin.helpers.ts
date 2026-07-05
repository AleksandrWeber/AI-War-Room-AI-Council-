import type {
  MetricizabilityAdminAction,
  MetricizabilityAdminRecord,
  MetricizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMetricizabilityDomainInventory = {
  domain: MetricizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMetricizabilityAdminRecords(
  inventory: WorkspaceMetricizabilityDomainInventory[],
): MetricizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMetricizabilityAdminStats(input: {
  records: MetricizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MetricizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const metricizabilityPercent =
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
    metricizabilityPercent,
  }
}

export function getMetricizabilityAdminGuidance(input: {
  stats: MetricizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect metricizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial metricizability coverage and refresh the metricizability summary.'
  }

  if (input.stats.metricizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key metricizability below the 95% target and refresh the metricizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace metricizability coverage and refresh the metricizability summary.'
}

export function resolveMetricizabilityAdminActions(): MetricizabilityAdminAction[] {
  return ['refresh_metricizability_summary']
}
