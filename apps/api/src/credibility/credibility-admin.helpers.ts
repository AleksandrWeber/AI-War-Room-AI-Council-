import type {
  CredibilityAdminAction,
  CredibilityAdminRecord,
  CredibilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCredibilityDomainInventory = {
  domain: CredibilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCredibilityAdminRecords(
  inventory: WorkspaceCredibilityDomainInventory[],
): CredibilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCredibilityAdminStats(input: {
  records: CredibilityAdminRecord[]
  postgresConnectivity: boolean
}): CredibilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const credibilityPercent =
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
    credibilityPercent,
  }
}

export function getCredibilityAdminGuidance(input: {
  stats: CredibilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect credibility metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial credibility coverage and refresh the credibility summary.'
  }

  if (input.stats.credibilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice credibility below the 95% target and refresh the credibility summary.'
  }

  return 'Workspace owners and admins can inspect workspace credibility coverage and refresh the credibility summary.'
}

export function resolveCredibilityAdminActions(): CredibilityAdminAction[] {
  return ['refresh_credibility_summary']
}
