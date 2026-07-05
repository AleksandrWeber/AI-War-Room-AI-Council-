import type {
  ModifiabilityAdminAction,
  ModifiabilityAdminRecord,
  ModifiabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceModifiabilityDomainInventory = {
  domain: ModifiabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildModifiabilityAdminRecords(
  inventory: WorkspaceModifiabilityDomainInventory[],
): ModifiabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildModifiabilityAdminStats(input: {
  records: ModifiabilityAdminRecord[]
  postgresConnectivity: boolean
}): ModifiabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const modifiabilityPercent =
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
    modifiabilityPercent,
  }
}

export function getModifiabilityAdminGuidance(input: {
  stats: ModifiabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect modifiability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial modifiability coverage and refresh the modifiability summary.'
  }

  if (input.stats.modifiabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key modifiability below the 95% target and refresh the modifiability summary.'
  }

  return 'Workspace owners and admins can inspect workspace modifiability coverage and refresh the modifiability summary.'
}

export function resolveModifiabilityAdminActions(): ModifiabilityAdminAction[] {
  return ['refresh_modifiability_summary']
}
