import type {
  AsynchronizabilityAdminAction,
  AsynchronizabilityAdminRecord,
  AsynchronizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAsynchronizabilityDomainInventory = {
  domain: AsynchronizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAsynchronizabilityAdminRecords(
  inventory: WorkspaceAsynchronizabilityDomainInventory[],
): AsynchronizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAsynchronizabilityAdminStats(input: {
  records: AsynchronizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AsynchronizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const asynchronizabilityPercent =
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
    asynchronizabilityPercent,
  }
}

export function getAsynchronizabilityAdminGuidance(input: {
  stats: AsynchronizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect asynchronizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial asynchronizability coverage and refresh the asynchronizability summary.'
  }

  if (input.stats.asynchronizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership asynchronizability below the 95% target and refresh the asynchronizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace asynchronizability coverage and refresh the asynchronizability summary.'
}

export function resolveAsynchronizabilityAdminActions(): AsynchronizabilityAdminAction[] {
  return ['refresh_asynchronizability_summary']
}
