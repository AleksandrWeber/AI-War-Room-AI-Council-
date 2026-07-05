import type {
  MaterializationizabilityAdminAction,
  MaterializationizabilityAdminRecord,
  MaterializationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMaterializationizabilityDomainInventory = {
  domain: MaterializationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMaterializationizabilityAdminRecords(
  inventory: WorkspaceMaterializationizabilityDomainInventory[],
): MaterializationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMaterializationizabilityAdminStats(input: {
  records: MaterializationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MaterializationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const materializationizabilityPercent =
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
    materializationizabilityPercent,
  }
}

export function getMaterializationizabilityAdminGuidance(input: {
  stats: MaterializationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect materializationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial materializationizability coverage and refresh the materializationizability summary.'
  }

  if (input.stats.materializationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health materializationizability below the 95% target and refresh the materializationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace materializationizability coverage and refresh the materializationizability summary.'
}

export function resolveMaterializationizabilityAdminActions(): MaterializationizabilityAdminAction[] {
  return ['refresh_materializationizability_summary']
}
