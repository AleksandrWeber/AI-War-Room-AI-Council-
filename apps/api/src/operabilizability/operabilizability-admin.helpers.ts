import type {
  OperabilizabilityAdminAction,
  OperabilizabilityAdminRecord,
  OperabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceOperabilizabilityDomainInventory = {
  domain: OperabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildOperabilizabilityAdminRecords(
  inventory: WorkspaceOperabilizabilityDomainInventory[],
): OperabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildOperabilizabilityAdminStats(input: {
  records: OperabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): OperabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const operabilizabilityPercent =
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
    operabilizabilityPercent,
  }
}

export function getOperabilizabilityAdminGuidance(input: {
  stats: OperabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect operabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial operabilizability coverage and refresh the operabilizability summary.'
  }

  if (input.stats.operabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key operabilizability below the 95% target and refresh the operabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace operabilizability coverage and refresh the operabilizability summary.'
}

export function resolveOperabilizabilityAdminActions(): OperabilizabilityAdminAction[] {
  return ['refresh_operabilizability_summary']
}
