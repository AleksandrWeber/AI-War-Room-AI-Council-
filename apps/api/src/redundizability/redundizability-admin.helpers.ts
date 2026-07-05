import type {
  RedundizabilityAdminAction,
  RedundizabilityAdminRecord,
  RedundizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRedundizabilityDomainInventory = {
  domain: RedundizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRedundizabilityAdminRecords(
  inventory: WorkspaceRedundizabilityDomainInventory[],
): RedundizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRedundizabilityAdminStats(input: {
  records: RedundizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RedundizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const redundizabilityPercent =
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
    redundizabilityPercent,
  }
}

export function getRedundizabilityAdminGuidance(input: {
  stats: RedundizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect redundizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial redundizability coverage and refresh the redundizability summary.'
  }

  if (input.stats.redundizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage redundizability below the 95% target and refresh the redundizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace redundizability coverage and refresh the redundizability summary.'
}

export function resolveRedundizabilityAdminActions(): RedundizabilityAdminAction[] {
  return ['refresh_redundizability_summary']
}
