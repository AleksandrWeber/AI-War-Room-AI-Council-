import type {
  DialectizabilityAdminAction,
  DialectizabilityAdminRecord,
  DialectizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDialectizabilityDomainInventory = {
  domain: DialectizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDialectizabilityAdminRecords(
  inventory: WorkspaceDialectizabilityDomainInventory[],
): DialectizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDialectizabilityAdminStats(input: {
  records: DialectizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DialectizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const dialectizabilityPercent =
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
    dialectizabilityPercent,
  }
}

export function getDialectizabilityAdminGuidance(input: {
  stats: DialectizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect dialectizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial dialectizability coverage and refresh the dialectizability summary.'
  }

  if (input.stats.dialectizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key dialectizability below the 95% target and refresh the dialectizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace dialectizability coverage and refresh the dialectizability summary.'
}

export function resolveDialectizabilityAdminActions(): DialectizabilityAdminAction[] {
  return ['refresh_dialectizability_summary']
}
