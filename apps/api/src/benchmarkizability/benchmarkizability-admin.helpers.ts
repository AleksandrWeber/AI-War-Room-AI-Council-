import type {
  BenchmarkizabilityAdminAction,
  BenchmarkizabilityAdminRecord,
  BenchmarkizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceBenchmarkizabilityDomainInventory = {
  domain: BenchmarkizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildBenchmarkizabilityAdminRecords(
  inventory: WorkspaceBenchmarkizabilityDomainInventory[],
): BenchmarkizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildBenchmarkizabilityAdminStats(input: {
  records: BenchmarkizabilityAdminRecord[]
  postgresConnectivity: boolean
}): BenchmarkizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const benchmarkizabilityPercent =
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
    benchmarkizabilityPercent,
  }
}

export function getBenchmarkizabilityAdminGuidance(input: {
  stats: BenchmarkizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect benchmarkizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial benchmarkizability coverage and refresh the benchmarkizability summary.'
  }

  if (input.stats.benchmarkizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership benchmarkizability below the 95% target and refresh the benchmarkizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace benchmarkizability coverage and refresh the benchmarkizability summary.'
}

export function resolveBenchmarkizabilityAdminActions(): BenchmarkizabilityAdminAction[] {
  return ['refresh_benchmarkizability_summary']
}
