import type {
  RegressizabilityAdminAction,
  RegressizabilityAdminRecord,
  RegressizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRegressizabilityDomainInventory = {
  domain: RegressizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRegressizabilityAdminRecords(
  inventory: WorkspaceRegressizabilityDomainInventory[],
): RegressizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRegressizabilityAdminStats(input: {
  records: RegressizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RegressizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const regressizabilityPercent =
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
    regressizabilityPercent,
  }
}

export function getRegressizabilityAdminGuidance(input: {
  stats: RegressizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect regressizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial regressizability coverage and refresh the regressizability summary.'
  }

  if (input.stats.regressizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage regressizability below the 95% target and refresh the regressizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace regressizability coverage and refresh the regressizability summary.'
}

export function resolveRegressizabilityAdminActions(): RegressizabilityAdminAction[] {
  return ['refresh_regressizability_summary']
}
