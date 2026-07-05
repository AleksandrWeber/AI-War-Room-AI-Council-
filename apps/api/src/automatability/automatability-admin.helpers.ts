import type {
  AutomatabilityAdminAction,
  AutomatabilityAdminRecord,
  AutomatabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAutomatabilityDomainInventory = {
  domain: AutomatabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAutomatabilityAdminRecords(
  inventory: WorkspaceAutomatabilityDomainInventory[],
): AutomatabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAutomatabilityAdminStats(input: {
  records: AutomatabilityAdminRecord[]
  postgresConnectivity: boolean
}): AutomatabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'agent_outputs')
      ?.recordCount ?? 0
  const automatabilityPercent =
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
    automatabilityPercent,
  }
}

export function getAutomatabilityAdminGuidance(input: {
  stats: AutomatabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect automatability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial automatability coverage and refresh the automatability summary.'
  }

  if (input.stats.automatabilityPercent < 95) {
    return 'Workspace owners and admins can inspect agent output automatability below the 95% target and refresh the automatability summary.'
  }

  return 'Workspace owners and admins can inspect workspace automatability coverage and refresh the automatability summary.'
}

export function resolveAutomatabilityAdminActions(): AutomatabilityAdminAction[] {
  return ['refresh_automatability_summary']
}
