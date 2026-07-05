import type {
  FootnotizabilityAdminAction,
  FootnotizabilityAdminRecord,
  FootnotizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceFootnotizabilityDomainInventory = {
  domain: FootnotizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildFootnotizabilityAdminRecords(
  inventory: WorkspaceFootnotizabilityDomainInventory[],
): FootnotizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildFootnotizabilityAdminStats(input: {
  records: FootnotizabilityAdminRecord[]
  postgresConnectivity: boolean
}): FootnotizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const footnotizabilityPercent =
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
    footnotizabilityPercent,
  }
}

export function getFootnotizabilityAdminGuidance(input: {
  stats: FootnotizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect footnotizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial footnotizability coverage and refresh the footnotizability summary.'
  }

  if (input.stats.footnotizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification footnotizability below the 95% target and refresh the footnotizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace footnotizability coverage and refresh the footnotizability summary.'
}

export function resolveFootnotizabilityAdminActions(): FootnotizabilityAdminAction[] {
  return ['refresh_footnotizability_summary']
}
