import type {
  NackizabilityAdminAction,
  NackizabilityAdminRecord,
  NackizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceNackizabilityDomainInventory = {
  domain: NackizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildNackizabilityAdminRecords(
  inventory: WorkspaceNackizabilityDomainInventory[],
): NackizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildNackizabilityAdminStats(input: {
  records: NackizabilityAdminRecord[]
  postgresConnectivity: boolean
}): NackizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const nackizabilityPercent =
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
    nackizabilityPercent,
  }
}

export function getNackizabilityAdminGuidance(input: {
  stats: NackizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect nackizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial nackizability coverage and refresh the nackizability summary.'
  }

  if (input.stats.nackizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage nackizability below the 95% target and refresh the nackizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace nackizability coverage and refresh the nackizability summary.'
}

export function resolveNackizabilityAdminActions(): NackizabilityAdminAction[] {
  return ['refresh_nackizability_summary']
}
