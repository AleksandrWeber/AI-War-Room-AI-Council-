import type {
  NotifizabilityAdminAction,
  NotifizabilityAdminRecord,
  NotifizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceNotifizabilityDomainInventory = {
  domain: NotifizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildNotifizabilityAdminRecords(
  inventory: WorkspaceNotifizabilityDomainInventory[],
): NotifizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildNotifizabilityAdminStats(input: {
  records: NotifizabilityAdminRecord[]
  postgresConnectivity: boolean
}): NotifizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const notifizabilityPercent =
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
    notifizabilityPercent,
  }
}

export function getNotifizabilityAdminGuidance(input: {
  stats: NotifizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect notifizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial notifizability coverage and refresh the notifizability summary.'
  }

  if (input.stats.notifizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification notifizability below the 95% target and refresh the notifizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace notifizability coverage and refresh the notifizability summary.'
}

export function resolveNotifizabilityAdminActions(): NotifizabilityAdminAction[] {
  return ['refresh_notifizability_summary']
}
