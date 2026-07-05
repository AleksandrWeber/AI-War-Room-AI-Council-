import type {
  RestoreizabilityAdminAction,
  RestoreizabilityAdminRecord,
  RestoreizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRestoreizabilityDomainInventory = {
  domain: RestoreizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRestoreizabilityAdminRecords(
  inventory: WorkspaceRestoreizabilityDomainInventory[],
): RestoreizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRestoreizabilityAdminStats(input: {
  records: RestoreizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RestoreizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const restoreizabilityPercent =
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
    restoreizabilityPercent,
  }
}

export function getRestoreizabilityAdminGuidance(input: {
  stats: RestoreizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect restoreizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial restoreizability coverage and refresh the restoreizability summary.'
  }

  if (input.stats.restoreizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook restoreizability below the 95% target and refresh the restoreizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace restoreizability coverage and refresh the restoreizability summary.'
}

export function resolveRestoreizabilityAdminActions(): RestoreizabilityAdminAction[] {
  return ['refresh_restoreizability_summary']
}
