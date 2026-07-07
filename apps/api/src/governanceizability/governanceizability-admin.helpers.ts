import type {
  GovernanceizabilityAdminAction,
  GovernanceizabilityAdminRecord,
  GovernanceizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceGovernanceizabilityDomainInventory = {
  domain: GovernanceizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildGovernanceizabilityAdminRecords(
  inventory: WorkspaceGovernanceizabilityDomainInventory[],
): GovernanceizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildGovernanceizabilityAdminStats(input: {
  records: GovernanceizabilityAdminRecord[]
  postgresConnectivity: boolean
}): GovernanceizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const governanceizabilityPercent =
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
    governanceizabilityPercent,
  }
}

export function getGovernanceizabilityAdminGuidance(input: {
  stats: GovernanceizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect governanceizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial governanceizability coverage and refresh the governanceizability summary.'
  }

  if (input.stats.governanceizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification governanceizability below the 95% target and refresh the governanceizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace governanceizability coverage and refresh the governanceizability summary.'
}

export function resolveGovernanceizabilityAdminActions(): GovernanceizabilityAdminAction[] {
  return ['refresh_governanceizability_summary']
}
