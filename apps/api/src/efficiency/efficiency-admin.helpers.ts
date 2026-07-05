import type {
  EfficiencyAdminAction,
  EfficiencyAdminRecord,
  EfficiencyAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceEfficiencyDomainInventory = {
  domain: EfficiencyAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildEfficiencyAdminRecords(
  inventory: WorkspaceEfficiencyDomainInventory[],
): EfficiencyAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildEfficiencyAdminStats(input: {
  records: EfficiencyAdminRecord[]
  postgresConnectivity: boolean
}): EfficiencyAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const usageEvents =
    input.records.find((record) => record.domain === 'usage_events')
      ?.recordCount ?? 0
  const efficiencyPercent =
    completedRuns === 0
      ? 100
      : Math.min(100, Math.round((usageEvents / completedRuns) * 100))

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    efficiencyPercent,
  }
}

export function getEfficiencyAdminGuidance(input: {
  stats: EfficiencyAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect efficiency metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial efficiency coverage and refresh the efficiency summary.'
  }

  if (input.stats.efficiencyPercent < 95) {
    return 'Workspace owners and admins can inspect usage telemetry efficiency below the 95% target and refresh the efficiency summary.'
  }

  return 'Workspace owners and admins can inspect workspace efficiency coverage and refresh the efficiency summary.'
}

export function resolveEfficiencyAdminActions(): EfficiencyAdminAction[] {
  return ['refresh_efficiency_summary']
}
