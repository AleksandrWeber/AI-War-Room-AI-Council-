import type {
  AppropriatenessAdminAction,
  AppropriatenessAdminRecord,
  AppropriatenessAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAppropriatenessDomainInventory = {
  domain: AppropriatenessAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAppropriatenessAdminRecords(
  inventory: WorkspaceAppropriatenessDomainInventory[],
): AppropriatenessAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAppropriatenessAdminStats(input: {
  records: AppropriatenessAdminRecord[]
  postgresConnectivity: boolean
}): AppropriatenessAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const appropriatenessPercent =
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
    appropriatenessPercent,
  }
}

export function getAppropriatenessAdminGuidance(input: {
  stats: AppropriatenessAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect appropriateness metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial appropriateness coverage and refresh the appropriateness summary.'
  }

  if (input.stats.appropriatenessPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice appropriateness below the 95% target and refresh the appropriateness summary.'
  }

  return 'Workspace owners and admins can inspect workspace appropriateness coverage and refresh the appropriateness summary.'
}

export function resolveAppropriatenessAdminActions(): AppropriatenessAdminAction[] {
  return ['refresh_appropriateness_summary']
}
