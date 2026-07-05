import type {
  AuthenticityAdminAction,
  AuthenticityAdminRecord,
  AuthenticityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAuthenticityDomainInventory = {
  domain: AuthenticityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAuthenticityAdminRecords(
  inventory: WorkspaceAuthenticityDomainInventory[],
): AuthenticityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAuthenticityAdminStats(input: {
  records: AuthenticityAdminRecord[]
  postgresConnectivity: boolean
}): AuthenticityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'moderator_syntheses')
      ?.recordCount ?? 0
  const authenticityPercent =
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
    authenticityPercent,
  }
}

export function getAuthenticityAdminGuidance(input: {
  stats: AuthenticityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect authenticity metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial authenticity coverage and refresh the authenticity summary.'
  }

  if (input.stats.authenticityPercent < 95) {
    return 'Workspace owners and admins can inspect moderator synthesis authenticity below the 95% target and refresh the authenticity summary.'
  }

  return 'Workspace owners and admins can inspect workspace authenticity coverage and refresh the authenticity summary.'
}

export function resolveAuthenticityAdminActions(): AuthenticityAdminAction[] {
  return ['refresh_authenticity_summary']
}
