import type {
  NotarproofizabilityAdminAction,
  NotarproofizabilityAdminRecord,
  NotarproofizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceNotarproofizabilityDomainInventory = {
  domain: NotarproofizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildNotarproofizabilityAdminRecords(
  inventory: WorkspaceNotarproofizabilityDomainInventory[],
): NotarproofizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildNotarproofizabilityAdminStats(input: {
  records: NotarproofizabilityAdminRecord[]
  postgresConnectivity: boolean
}): NotarproofizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const notarproofizabilityPercent =
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
    notarproofizabilityPercent,
  }
}

export function getNotarproofizabilityAdminGuidance(input: {
  stats: NotarproofizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect notarproofizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial notarproofizability coverage and refresh the notarproofizability summary.'
  }

  if (input.stats.notarproofizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification notarproofizability below the 95% target and refresh the notarproofizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace notarproofizability coverage and refresh the notarproofizability summary.'
}

export function resolveNotarproofizabilityAdminActions(): NotarproofizabilityAdminAction[] {
  return ['refresh_notarproofizability_summary']
}
