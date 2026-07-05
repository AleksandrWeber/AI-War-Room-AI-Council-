import type {
  SubscribizabilityAdminAction,
  SubscribizabilityAdminRecord,
  SubscribizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSubscribizabilityDomainInventory = {
  domain: SubscribizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSubscribizabilityAdminRecords(
  inventory: WorkspaceSubscribizabilityDomainInventory[],
): SubscribizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSubscribizabilityAdminStats(input: {
  records: SubscribizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SubscribizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const subscribizabilityPercent =
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
    subscribizabilityPercent,
  }
}

export function getSubscribizabilityAdminGuidance(input: {
  stats: SubscribizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect subscribizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial subscribizability coverage and refresh the subscribizability summary.'
  }

  if (input.stats.subscribizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook subscribizability below the 95% target and refresh the subscribizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace subscribizability coverage and refresh the subscribizability summary.'
}

export function resolveSubscribizabilityAdminActions(): SubscribizabilityAdminAction[] {
  return ['refresh_subscribizability_summary']
}
