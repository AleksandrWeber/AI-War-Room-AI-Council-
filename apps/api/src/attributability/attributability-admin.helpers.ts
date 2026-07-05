import type {
  AttributabilityAdminAction,
  AttributabilityAdminRecord,
  AttributabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAttributabilityDomainInventory = {
  domain: AttributabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAttributabilityAdminRecords(
  inventory: WorkspaceAttributabilityDomainInventory[],
): AttributabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAttributabilityAdminStats(input: {
  records: AttributabilityAdminRecord[]
  postgresConnectivity: boolean
}): AttributabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'agent_outputs')
      ?.recordCount ?? 0
  const attributabilityPercent =
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
    attributabilityPercent,
  }
}

export function getAttributabilityAdminGuidance(input: {
  stats: AttributabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect attributability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial attributability coverage and refresh the attributability summary.'
  }

  if (input.stats.attributabilityPercent < 95) {
    return 'Workspace owners and admins can inspect agent output attributability below the 95% target and refresh the attributability summary.'
  }

  return 'Workspace owners and admins can inspect workspace attributability coverage and refresh the attributability summary.'
}

export function resolveAttributabilityAdminActions(): AttributabilityAdminAction[] {
  return ['refresh_attributability_summary']
}
