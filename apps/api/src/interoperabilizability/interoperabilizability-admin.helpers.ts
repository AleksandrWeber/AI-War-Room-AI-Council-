import type {
  InteroperabilizabilityAdminAction,
  InteroperabilizabilityAdminRecord,
  InteroperabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceInteroperabilizabilityDomainInventory = {
  domain: InteroperabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildInteroperabilizabilityAdminRecords(
  inventory: WorkspaceInteroperabilizabilityDomainInventory[],
): InteroperabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildInteroperabilizabilityAdminStats(input: {
  records: InteroperabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): InteroperabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const interoperabilizabilityPercent =
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
    interoperabilizabilityPercent,
  }
}

export function getInteroperabilizabilityAdminGuidance(input: {
  stats: InteroperabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect interoperabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial interoperabilizability coverage and refresh the interoperabilizability summary.'
  }

  if (input.stats.interoperabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage interoperabilizability below the 95% target and refresh the interoperabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace interoperabilizability coverage and refresh the interoperabilizability summary.'
}

export function resolveInteroperabilizabilityAdminActions(): InteroperabilizabilityAdminAction[] {
  return ['refresh_interoperabilizability_summary']
}
