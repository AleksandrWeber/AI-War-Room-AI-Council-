import type {
  DeliverabilityAdminAction,
  DeliverabilityAdminRecord,
  DeliverabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDeliverabilityDomainInventory = {
  domain: DeliverabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDeliverabilityAdminRecords(
  inventory: WorkspaceDeliverabilityDomainInventory[],
): DeliverabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDeliverabilityAdminStats(input: {
  records: DeliverabilityAdminRecord[]
  postgresConnectivity: boolean
}): DeliverabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const deliverabilityPercent =
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
    deliverabilityPercent,
  }
}

export function getDeliverabilityAdminGuidance(input: {
  stats: DeliverabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect deliverability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial deliverability coverage and refresh the deliverability summary.'
  }

  if (input.stats.deliverabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification deliverability below the 95% target and refresh the deliverability summary.'
  }

  return 'Workspace owners and admins can inspect workspace deliverability coverage and refresh the deliverability summary.'
}

export function resolveDeliverabilityAdminActions(): DeliverabilityAdminAction[] {
  return ['refresh_deliverability_summary']
}
