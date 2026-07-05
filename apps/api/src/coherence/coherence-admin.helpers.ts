import type {
  CoherenceAdminAction,
  CoherenceAdminRecord,
  CoherenceAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCoherenceDomainInventory = {
  domain: CoherenceAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCoherenceAdminRecords(
  inventory: WorkspaceCoherenceDomainInventory[],
): CoherenceAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCoherenceAdminStats(input: {
  records: CoherenceAdminRecord[]
  postgresConnectivity: boolean
}): CoherenceAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const coherencePercent =
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
    coherencePercent,
  }
}

export function getCoherenceAdminGuidance(input: {
  stats: CoherenceAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect coherence metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial coherence coverage and refresh the coherence summary.'
  }

  if (input.stats.coherencePercent < 95) {
    return 'Workspace owners and admins can inspect workflow coherence below the 95% target and refresh the coherence summary.'
  }

  return 'Workspace owners and admins can inspect workspace coherence coverage and refresh the coherence summary.'
}

export function resolveCoherenceAdminActions(): CoherenceAdminAction[] {
  return ['refresh_coherence_summary']
}
