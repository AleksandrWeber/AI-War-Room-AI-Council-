import type {
  GovernancetrackizabilityAdminAction,
  GovernancetrackizabilityAdminRecord,
  GovernancetrackizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceGovernancetrackizabilityDomainInventory = {
  domain: GovernancetrackizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildGovernancetrackizabilityAdminRecords(
  inventory: WorkspaceGovernancetrackizabilityDomainInventory[],
): GovernancetrackizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildGovernancetrackizabilityAdminStats(input: {
  records: GovernancetrackizabilityAdminRecord[]
  postgresConnectivity: boolean
}): GovernancetrackizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const governancetrackizabilityPercent =
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
    governancetrackizabilityPercent,
  }
}

export function getGovernancetrackizabilityAdminGuidance(input: {
  stats: GovernancetrackizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect governancetrackizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial governancetrackizability coverage and refresh the governancetrackizability summary.'
  }

  if (input.stats.governancetrackizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice governancetrackizability below the 95% target and refresh the governancetrackizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace governancetrackizability coverage and refresh the governancetrackizability summary.'
}

export function resolveGovernancetrackizabilityAdminActions(): GovernancetrackizabilityAdminAction[] {
  return ['refresh_governancetrackizability_summary']
}
