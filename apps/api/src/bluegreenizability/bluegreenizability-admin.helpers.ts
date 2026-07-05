import type {
  BluegreenizabilityAdminAction,
  BluegreenizabilityAdminRecord,
  BluegreenizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceBluegreenizabilityDomainInventory = {
  domain: BluegreenizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildBluegreenizabilityAdminRecords(
  inventory: WorkspaceBluegreenizabilityDomainInventory[],
): BluegreenizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildBluegreenizabilityAdminStats(input: {
  records: BluegreenizabilityAdminRecord[]
  postgresConnectivity: boolean
}): BluegreenizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const bluegreenizabilityPercent =
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
    bluegreenizabilityPercent,
  }
}

export function getBluegreenizabilityAdminGuidance(input: {
  stats: BluegreenizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect bluegreenizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial bluegreenizability coverage and refresh the bluegreenizability summary.'
  }

  if (input.stats.bluegreenizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit bluegreenizability below the 95% target and refresh the bluegreenizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace bluegreenizability coverage and refresh the bluegreenizability summary.'
}

export function resolveBluegreenizabilityAdminActions(): BluegreenizabilityAdminAction[] {
  return ['refresh_bluegreenizability_summary']
}
