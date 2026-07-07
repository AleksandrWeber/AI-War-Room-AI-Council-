import type {
  SegregationizabilityAdminAction,
  SegregationizabilityAdminRecord,
  SegregationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSegregationizabilityDomainInventory = {
  domain: SegregationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSegregationizabilityAdminRecords(
  inventory: WorkspaceSegregationizabilityDomainInventory[],
): SegregationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSegregationizabilityAdminStats(input: {
  records: SegregationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SegregationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const segregationizabilityPercent =
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
    segregationizabilityPercent,
  }
}

export function getSegregationizabilityAdminGuidance(input: {
  stats: SegregationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect segregationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial segregationizability coverage and refresh the segregationizability summary.'
  }

  if (input.stats.segregationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification segregationizability below the 95% target and refresh the segregationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace segregationizability coverage and refresh the segregationizability summary.'
}

export function resolveSegregationizabilityAdminActions(): SegregationizabilityAdminAction[] {
  return ['refresh_segregationizability_summary']
}
