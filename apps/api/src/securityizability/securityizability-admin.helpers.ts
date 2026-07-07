import type {
  SecurityizabilityAdminAction,
  SecurityizabilityAdminRecord,
  SecurityizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSecurityizabilityDomainInventory = {
  domain: SecurityizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSecurityizabilityAdminRecords(
  inventory: WorkspaceSecurityizabilityDomainInventory[],
): SecurityizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSecurityizabilityAdminStats(input: {
  records: SecurityizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SecurityizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const securityizabilityPercent =
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
    securityizabilityPercent,
  }
}

export function getSecurityizabilityAdminGuidance(input: {
  stats: SecurityizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect securityizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial securityizability coverage and refresh the securityizability summary.'
  }

  if (input.stats.securityizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership securityizability below the 95% target and refresh the securityizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace securityizability coverage and refresh the securityizability summary.'
}

export function resolveSecurityizabilityAdminActions(): SecurityizabilityAdminAction[] {
  return ['refresh_securityizability_summary']
}
