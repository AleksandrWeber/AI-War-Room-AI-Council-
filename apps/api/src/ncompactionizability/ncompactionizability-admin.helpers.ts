import type {
  NcompactionizabilityAdminAction,
  NcompactionizabilityAdminRecord,
  NcompactionizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceNcompactionizabilityDomainInventory = {
  domain: NcompactionizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildNcompactionizabilityAdminRecords(
  inventory: WorkspaceNcompactionizabilityDomainInventory[],
): NcompactionizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildNcompactionizabilityAdminStats(input: {
  records: NcompactionizabilityAdminRecord[]
  postgresConnectivity: boolean
}): NcompactionizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const ncompactionizabilityPercent =
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
    ncompactionizabilityPercent,
  }
}

export function getNcompactionizabilityAdminGuidance(input: {
  stats: NcompactionizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect ncompactionizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial ncompactionizability coverage and refresh the ncompactionizability summary.'
  }

  if (input.stats.ncompactionizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage ncompactionizability below the 95% target and refresh the ncompactionizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace ncompactionizability coverage and refresh the ncompactionizability summary.'
}

export function resolveNcompactionizabilityAdminActions(): NcompactionizabilityAdminAction[] {
  return ['refresh_ncompactionizability_summary']
}
