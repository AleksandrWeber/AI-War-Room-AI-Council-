import type {
  RestorabilizabilityAdminAction,
  RestorabilizabilityAdminRecord,
  RestorabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRestorabilizabilityDomainInventory = {
  domain: RestorabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRestorabilizabilityAdminRecords(
  inventory: WorkspaceRestorabilizabilityDomainInventory[],
): RestorabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRestorabilizabilityAdminStats(input: {
  records: RestorabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RestorabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const restorabilizabilityPercent =
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
    restorabilizabilityPercent,
  }
}

export function getRestorabilizabilityAdminGuidance(input: {
  stats: RestorabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect restorabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial restorabilizability coverage and refresh the restorabilizability summary.'
  }

  if (input.stats.restorabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook restorabilizability below the 95% target and refresh the restorabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace restorabilizability coverage and refresh the restorabilizability summary.'
}

export function resolveRestorabilizabilityAdminActions(): RestorabilizabilityAdminAction[] {
  return ['refresh_restorabilizability_summary']
}
