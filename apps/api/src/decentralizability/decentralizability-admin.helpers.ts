import type {
  DecentralizabilityAdminAction,
  DecentralizabilityAdminRecord,
  DecentralizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDecentralizabilityDomainInventory = {
  domain: DecentralizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDecentralizabilityAdminRecords(
  inventory: WorkspaceDecentralizabilityDomainInventory[],
): DecentralizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDecentralizabilityAdminStats(input: {
  records: DecentralizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DecentralizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const decentralizabilityPercent =
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
    decentralizabilityPercent,
  }
}

export function getDecentralizabilityAdminGuidance(input: {
  stats: DecentralizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect decentralizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial decentralizability coverage and refresh the decentralizability summary.'
  }

  if (input.stats.decentralizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential decentralizability below the 95% target and refresh the decentralizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace decentralizability coverage and refresh the decentralizability summary.'
}

export function resolveDecentralizabilityAdminActions(): DecentralizabilityAdminAction[] {
  return ['refresh_decentralizability_summary']
}
