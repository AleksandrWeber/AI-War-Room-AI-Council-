import type {
  SystematizabilityAdminAction,
  SystematizabilityAdminRecord,
  SystematizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSystematizabilityDomainInventory = {
  domain: SystematizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSystematizabilityAdminRecords(
  inventory: WorkspaceSystematizabilityDomainInventory[],
): SystematizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSystematizabilityAdminStats(input: {
  records: SystematizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SystematizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const systematizabilityPercent =
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
    systematizabilityPercent,
  }
}

export function getSystematizabilityAdminGuidance(input: {
  stats: SystematizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect systematizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial systematizability coverage and refresh the systematizability summary.'
  }

  if (input.stats.systematizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook systematizability below the 95% target and refresh the systematizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace systematizability coverage and refresh the systematizability summary.'
}

export function resolveSystematizabilityAdminActions(): SystematizabilityAdminAction[] {
  return ['refresh_systematizability_summary']
}
