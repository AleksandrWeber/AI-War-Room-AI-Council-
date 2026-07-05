import type {
  DeducizabilityAdminAction,
  DeducizabilityAdminRecord,
  DeducizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDeducizabilityDomainInventory = {
  domain: DeducizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDeducizabilityAdminRecords(
  inventory: WorkspaceDeducizabilityDomainInventory[],
): DeducizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDeducizabilityAdminStats(input: {
  records: DeducizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DeducizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const deducizabilityPercent =
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
    deducizabilityPercent,
  }
}

export function getDeducizabilityAdminGuidance(input: {
  stats: DeducizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect deducizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial deducizability coverage and refresh the deducizability summary.'
  }

  if (input.stats.deducizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification deducizability below the 95% target and refresh the deducizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace deducizability coverage and refresh the deducizability summary.'
}

export function resolveDeducizabilityAdminActions(): DeducizabilityAdminAction[] {
  return ['refresh_deducizability_summary']
}
