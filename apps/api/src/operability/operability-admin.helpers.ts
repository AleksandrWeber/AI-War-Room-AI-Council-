import type {
  OperabilityAdminAction,
  OperabilityAdminRecord,
  OperabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceOperabilityDomainInventory = {
  domain: OperabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildOperabilityAdminRecords(
  inventory: WorkspaceOperabilityDomainInventory[],
): OperabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildOperabilityAdminStats(input: {
  records: OperabilityAdminRecord[]
  postgresConnectivity: boolean
}): OperabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const operabilityPercent =
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
    operabilityPercent,
  }
}

export function getOperabilityAdminGuidance(input: {
  stats: OperabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect operability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial operability coverage and refresh the operability summary.'
  }

  if (input.stats.operabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification operability below the 95% target and refresh the operability summary.'
  }

  return 'Workspace owners and admins can inspect workspace operability coverage and refresh the operability summary.'
}

export function resolveOperabilityAdminActions(): OperabilityAdminAction[] {
  return ['refresh_operability_summary']
}
