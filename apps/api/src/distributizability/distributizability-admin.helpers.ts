import type {
  DistributizabilityAdminAction,
  DistributizabilityAdminRecord,
  DistributizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDistributizabilityDomainInventory = {
  domain: DistributizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDistributizabilityAdminRecords(
  inventory: WorkspaceDistributizabilityDomainInventory[],
): DistributizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDistributizabilityAdminStats(input: {
  records: DistributizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DistributizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const distributizabilityPercent =
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
    distributizabilityPercent,
  }
}

export function getDistributizabilityAdminGuidance(input: {
  stats: DistributizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect distributizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial distributizability coverage and refresh the distributizability summary.'
  }

  if (input.stats.distributizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage distributizability below the 95% target and refresh the distributizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace distributizability coverage and refresh the distributizability summary.'
}

export function resolveDistributizabilityAdminActions(): DistributizabilityAdminAction[] {
  return ['refresh_distributizability_summary']
}
