import type {
  IsolatizabilityAdminAction,
  IsolatizabilityAdminRecord,
  IsolatizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIsolatizabilityDomainInventory = {
  domain: IsolatizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIsolatizabilityAdminRecords(
  inventory: WorkspaceIsolatizabilityDomainInventory[],
): IsolatizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIsolatizabilityAdminStats(input: {
  records: IsolatizabilityAdminRecord[]
  postgresConnectivity: boolean
}): IsolatizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const isolatizabilityPercent =
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
    isolatizabilityPercent,
  }
}

export function getIsolatizabilityAdminGuidance(input: {
  stats: IsolatizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect isolatizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial isolatizability coverage and refresh the isolatizability summary.'
  }

  if (input.stats.isolatizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key isolatizability below the 95% target and refresh the isolatizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace isolatizability coverage and refresh the isolatizability summary.'
}

export function resolveIsolatizabilityAdminActions(): IsolatizabilityAdminAction[] {
  return ['refresh_isolatizability_summary']
}
