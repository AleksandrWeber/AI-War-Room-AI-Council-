import type {
  GnoseizabilityAdminAction,
  GnoseizabilityAdminRecord,
  GnoseizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceGnoseizabilityDomainInventory = {
  domain: GnoseizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildGnoseizabilityAdminRecords(
  inventory: WorkspaceGnoseizabilityDomainInventory[],
): GnoseizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildGnoseizabilityAdminStats(input: {
  records: GnoseizabilityAdminRecord[]
  postgresConnectivity: boolean
}): GnoseizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const gnoseizabilityPercent =
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
    gnoseizabilityPercent,
  }
}

export function getGnoseizabilityAdminGuidance(input: {
  stats: GnoseizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect gnoseizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial gnoseizability coverage and refresh the gnoseizability summary.'
  }

  if (input.stats.gnoseizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage gnoseizability below the 95% target and refresh the gnoseizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace gnoseizability coverage and refresh the gnoseizability summary.'
}

export function resolveGnoseizabilityAdminActions(): GnoseizabilityAdminAction[] {
  return ['refresh_gnoseizability_summary']
}
