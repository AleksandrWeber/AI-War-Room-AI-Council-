import type {
  ContinuizabilityAdminAction,
  ContinuizabilityAdminRecord,
  ContinuizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceContinuizabilityDomainInventory = {
  domain: ContinuizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildContinuizabilityAdminRecords(
  inventory: WorkspaceContinuizabilityDomainInventory[],
): ContinuizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildContinuizabilityAdminStats(input: {
  records: ContinuizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ContinuizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const continuizabilityPercent =
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
    continuizabilityPercent,
  }
}

export function getContinuizabilityAdminGuidance(input: {
  stats: ContinuizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect continuizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial continuizability coverage and refresh the continuizability summary.'
  }

  if (input.stats.continuizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential continuizability below the 95% target and refresh the continuizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace continuizability coverage and refresh the continuizability summary.'
}

export function resolveContinuizabilityAdminActions(): ContinuizabilityAdminAction[] {
  return ['refresh_continuizability_summary']
}
