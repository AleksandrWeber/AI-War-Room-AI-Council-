import type {
  InterpolizabilityAdminAction,
  InterpolizabilityAdminRecord,
  InterpolizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceInterpolizabilityDomainInventory = {
  domain: InterpolizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildInterpolizabilityAdminRecords(
  inventory: WorkspaceInterpolizabilityDomainInventory[],
): InterpolizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildInterpolizabilityAdminStats(input: {
  records: InterpolizabilityAdminRecord[]
  postgresConnectivity: boolean
}): InterpolizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const interpolizabilityPercent =
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
    interpolizabilityPercent,
  }
}

export function getInterpolizabilityAdminGuidance(input: {
  stats: InterpolizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect interpolizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial interpolizability coverage and refresh the interpolizability summary.'
  }

  if (input.stats.interpolizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook interpolizability below the 95% target and refresh the interpolizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace interpolizability coverage and refresh the interpolizability summary.'
}

export function resolveInterpolizabilityAdminActions(): InterpolizabilityAdminAction[] {
  return ['refresh_interpolizability_summary']
}
