import type {
  WitnessledgerizabilityAdminAction,
  WitnessledgerizabilityAdminRecord,
  WitnessledgerizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceWitnessledgerizabilityDomainInventory = {
  domain: WitnessledgerizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildWitnessledgerizabilityAdminRecords(
  inventory: WorkspaceWitnessledgerizabilityDomainInventory[],
): WitnessledgerizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildWitnessledgerizabilityAdminStats(input: {
  records: WitnessledgerizabilityAdminRecord[]
  postgresConnectivity: boolean
}): WitnessledgerizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const witnessledgerizabilityPercent =
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
    witnessledgerizabilityPercent,
  }
}

export function getWitnessledgerizabilityAdminGuidance(input: {
  stats: WitnessledgerizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect witnessledgerizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial witnessledgerizability coverage and refresh the witnessledgerizability summary.'
  }

  if (input.stats.witnessledgerizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key witnessledgerizability below the 95% target and refresh the witnessledgerizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace witnessledgerizability coverage and refresh the witnessledgerizability summary.'
}

export function resolveWitnessledgerizabilityAdminActions(): WitnessledgerizabilityAdminAction[] {
  return ['refresh_witnessledgerizability_summary']
}
