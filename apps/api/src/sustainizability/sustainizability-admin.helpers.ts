import type {
  SustainizabilityAdminAction,
  SustainizabilityAdminRecord,
  SustainizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSustainizabilityDomainInventory = {
  domain: SustainizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSustainizabilityAdminRecords(
  inventory: WorkspaceSustainizabilityDomainInventory[],
): SustainizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSustainizabilityAdminStats(input: {
  records: SustainizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SustainizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const sustainizabilityPercent =
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
    sustainizabilityPercent,
  }
}

export function getSustainizabilityAdminGuidance(input: {
  stats: SustainizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect sustainizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial sustainizability coverage and refresh the sustainizability summary.'
  }

  if (input.stats.sustainizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health sustainizability below the 95% target and refresh the sustainizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace sustainizability coverage and refresh the sustainizability summary.'
}

export function resolveSustainizabilityAdminActions(): SustainizabilityAdminAction[] {
  return ['refresh_sustainizability_summary']
}
