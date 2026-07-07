import type {
  AuthenticationizabilityAdminAction,
  AuthenticationizabilityAdminRecord,
  AuthenticationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAuthenticationizabilityDomainInventory = {
  domain: AuthenticationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAuthenticationizabilityAdminRecords(
  inventory: WorkspaceAuthenticationizabilityDomainInventory[],
): AuthenticationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAuthenticationizabilityAdminStats(input: {
  records: AuthenticationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AuthenticationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const authenticationizabilityPercent =
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
    authenticationizabilityPercent,
  }
}

export function getAuthenticationizabilityAdminGuidance(input: {
  stats: AuthenticationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect authenticationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial authenticationizability coverage and refresh the authenticationizability summary.'
  }

  if (input.stats.authenticationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan authenticationizability below the 95% target and refresh the authenticationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace authenticationizability coverage and refresh the authenticationizability summary.'
}

export function resolveAuthenticationizabilityAdminActions(): AuthenticationizabilityAdminAction[] {
  return ['refresh_authenticationizability_summary']
}
