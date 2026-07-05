import type {
  ConfirmabilityAdminAction,
  ConfirmabilityAdminRecord,
  ConfirmabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConfirmabilityDomainInventory = {
  domain: ConfirmabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConfirmabilityAdminRecords(
  inventory: WorkspaceConfirmabilityDomainInventory[],
): ConfirmabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConfirmabilityAdminStats(input: {
  records: ConfirmabilityAdminRecord[]
  postgresConnectivity: boolean
}): ConfirmabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const confirmabilityPercent =
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
    confirmabilityPercent,
  }
}

export function getConfirmabilityAdminGuidance(input: {
  stats: ConfirmabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect confirmability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial confirmability coverage and refresh the confirmability summary.'
  }

  if (input.stats.confirmabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification confirmability below the 95% target and refresh the confirmability summary.'
  }

  return 'Workspace owners and admins can inspect workspace confirmability coverage and refresh the confirmability summary.'
}

export function resolveConfirmabilityAdminActions(): ConfirmabilityAdminAction[] {
  return ['refresh_confirmability_summary']
}
