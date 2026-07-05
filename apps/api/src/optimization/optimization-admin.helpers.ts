import type {
  OptimizationAdminAction,
  OptimizationAdminRecord,
  OptimizationAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceOptimizationDomainInventory = {
  domain: OptimizationAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildOptimizationAdminRecords(
  inventory: WorkspaceOptimizationDomainInventory[],
): OptimizationAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildOptimizationAdminStats(input: {
  records: OptimizationAdminRecord[]
  postgresConnectivity: boolean
}): OptimizationAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const modelHealthEvents =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const optimizationPercent =
    completedRuns === 0
      ? 100
      : Math.min(100, Math.round((modelHealthEvents / completedRuns) * 100))

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    optimizationPercent,
  }
}

export function getOptimizationAdminGuidance(input: {
  stats: OptimizationAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect optimization metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial optimization coverage and refresh the optimization summary.'
  }

  if (input.stats.optimizationPercent < 95) {
    return 'Workspace owners and admins can inspect model health optimization below the 95% target and refresh the optimization summary.'
  }

  return 'Workspace owners and admins can inspect workspace optimization coverage and refresh the optimization summary.'
}

export function resolveOptimizationAdminActions(): OptimizationAdminAction[] {
  return ['refresh_optimization_summary']
}
