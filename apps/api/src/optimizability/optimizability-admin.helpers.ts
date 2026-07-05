import type {
  OptimizabilityAdminAction,
  OptimizabilityAdminRecord,
  OptimizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceOptimizabilityDomainInventory = {
  domain: OptimizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildOptimizabilityAdminRecords(
  inventory: WorkspaceOptimizabilityDomainInventory[],
): OptimizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildOptimizabilityAdminStats(input: {
  records: OptimizabilityAdminRecord[]
  postgresConnectivity: boolean
}): OptimizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const optimizabilityPercent =
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
    optimizabilityPercent,
  }
}

export function getOptimizabilityAdminGuidance(input: {
  stats: OptimizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect optimizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial optimizability coverage and refresh the optimizability summary.'
  }

  if (input.stats.optimizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health optimizability below the 95% target and refresh the optimizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace optimizability coverage and refresh the optimizability summary.'
}

export function resolveOptimizabilityAdminActions(): OptimizabilityAdminAction[] {
  return ['refresh_optimizability_summary']
}
