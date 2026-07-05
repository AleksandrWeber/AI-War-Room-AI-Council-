import type {
  ExtrapolizabilityAdminAction,
  ExtrapolizabilityAdminRecord,
  ExtrapolizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceExtrapolizabilityDomainInventory = {
  domain: ExtrapolizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildExtrapolizabilityAdminRecords(
  inventory: WorkspaceExtrapolizabilityDomainInventory[],
): ExtrapolizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildExtrapolizabilityAdminStats(input: {
  records: ExtrapolizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ExtrapolizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const extrapolizabilityPercent =
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
    extrapolizabilityPercent,
  }
}

export function getExtrapolizabilityAdminGuidance(input: {
  stats: ExtrapolizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect extrapolizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial extrapolizability coverage and refresh the extrapolizability summary.'
  }

  if (input.stats.extrapolizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health extrapolizability below the 95% target and refresh the extrapolizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace extrapolizability coverage and refresh the extrapolizability summary.'
}

export function resolveExtrapolizabilityAdminActions(): ExtrapolizabilityAdminAction[] {
  return ['refresh_extrapolizability_summary']
}
