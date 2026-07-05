import type {
  ApproximatizabilityAdminAction,
  ApproximatizabilityAdminRecord,
  ApproximatizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceApproximatizabilityDomainInventory = {
  domain: ApproximatizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildApproximatizabilityAdminRecords(
  inventory: WorkspaceApproximatizabilityDomainInventory[],
): ApproximatizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildApproximatizabilityAdminStats(input: {
  records: ApproximatizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ApproximatizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const approximatizabilityPercent =
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
    approximatizabilityPercent,
  }
}

export function getApproximatizabilityAdminGuidance(input: {
  stats: ApproximatizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect approximatizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial approximatizability coverage and refresh the approximatizability summary.'
  }

  if (input.stats.approximatizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook approximatizability below the 95% target and refresh the approximatizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace approximatizability coverage and refresh the approximatizability summary.'
}

export function resolveApproximatizabilityAdminActions(): ApproximatizabilityAdminAction[] {
  return ['refresh_approximatizability_summary']
}
