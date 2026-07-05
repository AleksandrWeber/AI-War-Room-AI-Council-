import type {
  RhetorizabilityAdminAction,
  RhetorizabilityAdminRecord,
  RhetorizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRhetorizabilityDomainInventory = {
  domain: RhetorizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRhetorizabilityAdminRecords(
  inventory: WorkspaceRhetorizabilityDomainInventory[],
): RhetorizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRhetorizabilityAdminStats(input: {
  records: RhetorizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RhetorizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const rhetorizabilityPercent =
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
    rhetorizabilityPercent,
  }
}

export function getRhetorizabilityAdminGuidance(input: {
  stats: RhetorizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect rhetorizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial rhetorizability coverage and refresh the rhetorizability summary.'
  }

  if (input.stats.rhetorizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage rhetorizability below the 95% target and refresh the rhetorizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace rhetorizability coverage and refresh the rhetorizability summary.'
}

export function resolveRhetorizabilityAdminActions(): RhetorizabilityAdminAction[] {
  return ['refresh_rhetorizability_summary']
}
