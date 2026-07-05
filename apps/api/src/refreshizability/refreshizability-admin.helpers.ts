import type {
  RefreshizabilityAdminAction,
  RefreshizabilityAdminRecord,
  RefreshizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRefreshizabilityDomainInventory = {
  domain: RefreshizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRefreshizabilityAdminRecords(
  inventory: WorkspaceRefreshizabilityDomainInventory[],
): RefreshizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRefreshizabilityAdminStats(input: {
  records: RefreshizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RefreshizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const refreshizabilityPercent =
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
    refreshizabilityPercent,
  }
}

export function getRefreshizabilityAdminGuidance(input: {
  stats: RefreshizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect refreshizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial refreshizability coverage and refresh the refreshizability summary.'
  }

  if (input.stats.refreshizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook refreshizability below the 95% target and refresh the refreshizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace refreshizability coverage and refresh the refreshizability summary.'
}

export function resolveRefreshizabilityAdminActions(): RefreshizabilityAdminAction[] {
  return ['refresh_refreshizability_summary']
}
