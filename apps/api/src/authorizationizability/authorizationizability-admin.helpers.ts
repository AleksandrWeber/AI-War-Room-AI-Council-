import type {
  AuthorizationizabilityAdminAction,
  AuthorizationizabilityAdminRecord,
  AuthorizationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAuthorizationizabilityDomainInventory = {
  domain: AuthorizationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAuthorizationizabilityAdminRecords(
  inventory: WorkspaceAuthorizationizabilityDomainInventory[],
): AuthorizationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAuthorizationizabilityAdminStats(input: {
  records: AuthorizationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AuthorizationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const authorizationizabilityPercent =
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
    authorizationizabilityPercent,
  }
}

export function getAuthorizationizabilityAdminGuidance(input: {
  stats: AuthorizationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect authorizationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial authorizationizability coverage and refresh the authorizationizability summary.'
  }

  if (input.stats.authorizationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key authorizationizability below the 95% target and refresh the authorizationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace authorizationizability coverage and refresh the authorizationizability summary.'
}

export function resolveAuthorizationizabilityAdminActions(): AuthorizationizabilityAdminAction[] {
  return ['refresh_authorizationizability_summary']
}
