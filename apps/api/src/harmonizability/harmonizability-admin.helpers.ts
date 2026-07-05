import type {
  HarmonizabilityAdminAction,
  HarmonizabilityAdminRecord,
  HarmonizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceHarmonizabilityDomainInventory = {
  domain: HarmonizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildHarmonizabilityAdminRecords(
  inventory: WorkspaceHarmonizabilityDomainInventory[],
): HarmonizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildHarmonizabilityAdminStats(input: {
  records: HarmonizabilityAdminRecord[]
  postgresConnectivity: boolean
}): HarmonizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const harmonizabilityPercent =
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
    harmonizabilityPercent,
  }
}

export function getHarmonizabilityAdminGuidance(input: {
  stats: HarmonizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect harmonizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial harmonizability coverage and refresh the harmonizability summary.'
  }

  if (input.stats.harmonizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage harmonizability below the 95% target and refresh the harmonizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace harmonizability coverage and refresh the harmonizability summary.'
}

export function resolveHarmonizabilityAdminActions(): HarmonizabilityAdminAction[] {
  return ['refresh_harmonizability_summary']
}
