import type {
  CompilatizabilityAdminAction,
  CompilatizabilityAdminRecord,
  CompilatizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCompilatizabilityDomainInventory = {
  domain: CompilatizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCompilatizabilityAdminRecords(
  inventory: WorkspaceCompilatizabilityDomainInventory[],
): CompilatizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCompilatizabilityAdminStats(input: {
  records: CompilatizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CompilatizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const compilatizabilityPercent =
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
    compilatizabilityPercent,
  }
}

export function getCompilatizabilityAdminGuidance(input: {
  stats: CompilatizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect compilatizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial compilatizability coverage and refresh the compilatizability summary.'
  }

  if (input.stats.compilatizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health compilatizability below the 95% target and refresh the compilatizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace compilatizability coverage and refresh the compilatizability summary.'
}

export function resolveCompilatizabilityAdminActions(): CompilatizabilityAdminAction[] {
  return ['refresh_compilatizability_summary']
}
