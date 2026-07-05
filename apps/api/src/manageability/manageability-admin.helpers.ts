import type {
  ManageabilityAdminAction,
  ManageabilityAdminRecord,
  ManageabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceManageabilityDomainInventory = {
  domain: ManageabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildManageabilityAdminRecords(
  inventory: WorkspaceManageabilityDomainInventory[],
): ManageabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildManageabilityAdminStats(input: {
  records: ManageabilityAdminRecord[]
  postgresConnectivity: boolean
}): ManageabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const manageabilityPercent =
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
    manageabilityPercent,
  }
}

export function getManageabilityAdminGuidance(input: {
  stats: ManageabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect manageability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial manageability coverage and refresh the manageability summary.'
  }

  if (input.stats.manageabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification manageability below the 95% target and refresh the manageability summary.'
  }

  return 'Workspace owners and admins can inspect workspace manageability coverage and refresh the manageability summary.'
}

export function resolveManageabilityAdminActions(): ManageabilityAdminAction[] {
  return ['refresh_manageability_summary']
}
