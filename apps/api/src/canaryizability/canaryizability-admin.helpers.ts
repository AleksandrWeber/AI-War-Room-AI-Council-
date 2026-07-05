import type {
  CanaryizabilityAdminAction,
  CanaryizabilityAdminRecord,
  CanaryizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCanaryizabilityDomainInventory = {
  domain: CanaryizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCanaryizabilityAdminRecords(
  inventory: WorkspaceCanaryizabilityDomainInventory[],
): CanaryizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCanaryizabilityAdminStats(input: {
  records: CanaryizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CanaryizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const canaryizabilityPercent =
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
    canaryizabilityPercent,
  }
}

export function getCanaryizabilityAdminGuidance(input: {
  stats: CanaryizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect canaryizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial canaryizability coverage and refresh the canaryizability summary.'
  }

  if (input.stats.canaryizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage canaryizability below the 95% target and refresh the canaryizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace canaryizability coverage and refresh the canaryizability summary.'
}

export function resolveCanaryizabilityAdminActions(): CanaryizabilityAdminAction[] {
  return ['refresh_canaryizability_summary']
}
