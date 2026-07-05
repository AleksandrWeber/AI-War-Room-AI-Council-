import type {
  CoordinationizabilityAdminAction,
  CoordinationizabilityAdminRecord,
  CoordinationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCoordinationizabilityDomainInventory = {
  domain: CoordinationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCoordinationizabilityAdminRecords(
  inventory: WorkspaceCoordinationizabilityDomainInventory[],
): CoordinationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCoordinationizabilityAdminStats(input: {
  records: CoordinationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CoordinationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const coordinationizabilityPercent =
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
    coordinationizabilityPercent,
  }
}

export function getCoordinationizabilityAdminGuidance(input: {
  stats: CoordinationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect coordinationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial coordinationizability coverage and refresh the coordinationizability summary.'
  }

  if (input.stats.coordinationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key coordinationizability below the 95% target and refresh the coordinationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace coordinationizability coverage and refresh the coordinationizability summary.'
}

export function resolveCoordinationizabilityAdminActions(): CoordinationizabilityAdminAction[] {
  return ['refresh_coordinationizability_summary']
}
