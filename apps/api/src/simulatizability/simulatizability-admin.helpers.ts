import type {
  SimulatizabilityAdminAction,
  SimulatizabilityAdminRecord,
  SimulatizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSimulatizabilityDomainInventory = {
  domain: SimulatizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSimulatizabilityAdminRecords(
  inventory: WorkspaceSimulatizabilityDomainInventory[],
): SimulatizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSimulatizabilityAdminStats(input: {
  records: SimulatizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SimulatizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const simulatizabilityPercent =
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
    simulatizabilityPercent,
  }
}

export function getSimulatizabilityAdminGuidance(input: {
  stats: SimulatizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect simulatizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial simulatizability coverage and refresh the simulatizability summary.'
  }

  if (input.stats.simulatizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential simulatizability below the 95% target and refresh the simulatizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace simulatizability coverage and refresh the simulatizability summary.'
}

export function resolveSimulatizabilityAdminActions(): SimulatizabilityAdminAction[] {
  return ['refresh_simulatizability_summary']
}
