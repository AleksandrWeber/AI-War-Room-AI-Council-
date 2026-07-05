import type {
  ConcretizabilityAdminAction,
  ConcretizabilityAdminRecord,
  ConcretizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConcretizabilityDomainInventory = {
  domain: ConcretizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConcretizabilityAdminRecords(
  inventory: WorkspaceConcretizabilityDomainInventory[],
): ConcretizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConcretizabilityAdminStats(input: {
  records: ConcretizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ConcretizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const concretizabilityPercent =
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
    concretizabilityPercent,
  }
}

export function getConcretizabilityAdminGuidance(input: {
  stats: ConcretizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect concretizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial concretizability coverage and refresh the concretizability summary.'
  }

  if (input.stats.concretizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key concretizability below the 95% target and refresh the concretizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace concretizability coverage and refresh the concretizability summary.'
}

export function resolveConcretizabilityAdminActions(): ConcretizabilityAdminAction[] {
  return ['refresh_concretizability_summary']
}
