import type {
  ConnotabilityAdminAction,
  ConnotabilityAdminRecord,
  ConnotabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConnotabilityDomainInventory = {
  domain: ConnotabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConnotabilityAdminRecords(
  inventory: WorkspaceConnotabilityDomainInventory[],
): ConnotabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConnotabilityAdminStats(input: {
  records: ConnotabilityAdminRecord[]
  postgresConnectivity: boolean
}): ConnotabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const connotabilityPercent =
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
    connotabilityPercent,
  }
}

export function getConnotabilityAdminGuidance(input: {
  stats: ConnotabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect connotability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial connotability coverage and refresh the connotability summary.'
  }

  if (input.stats.connotabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage connotability below the 95% target and refresh the connotability summary.'
  }

  return 'Workspace owners and admins can inspect workspace connotability coverage and refresh the connotability summary.'
}

export function resolveConnotabilityAdminActions(): ConnotabilityAdminAction[] {
  return ['refresh_connotability_summary']
}
