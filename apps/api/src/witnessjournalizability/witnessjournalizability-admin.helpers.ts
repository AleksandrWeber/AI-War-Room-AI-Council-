import type {
  WitnessjournalizabilityAdminAction,
  WitnessjournalizabilityAdminRecord,
  WitnessjournalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceWitnessjournalizabilityDomainInventory = {
  domain: WitnessjournalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildWitnessjournalizabilityAdminRecords(
  inventory: WorkspaceWitnessjournalizabilityDomainInventory[],
): WitnessjournalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildWitnessjournalizabilityAdminStats(input: {
  records: WitnessjournalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): WitnessjournalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const witnessjournalizabilityPercent =
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
    witnessjournalizabilityPercent,
  }
}

export function getWitnessjournalizabilityAdminGuidance(input: {
  stats: WitnessjournalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect witnessjournalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial witnessjournalizability coverage and refresh the witnessjournalizability summary.'
  }

  if (input.stats.witnessjournalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key witnessjournalizability below the 95% target and refresh the witnessjournalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace witnessjournalizability coverage and refresh the witnessjournalizability summary.'
}

export function resolveWitnessjournalizabilityAdminActions(): WitnessjournalizabilityAdminAction[] {
  return ['refresh_witnessjournalizability_summary']
}
