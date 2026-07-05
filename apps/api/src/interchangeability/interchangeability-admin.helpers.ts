import type {
  InterchangeabilityAdminAction,
  InterchangeabilityAdminRecord,
  InterchangeabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceInterchangeabilityDomainInventory = {
  domain: InterchangeabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildInterchangeabilityAdminRecords(
  inventory: WorkspaceInterchangeabilityDomainInventory[],
): InterchangeabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildInterchangeabilityAdminStats(input: {
  records: InterchangeabilityAdminRecord[]
  postgresConnectivity: boolean
}): InterchangeabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const interchangeabilityPercent =
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
    interchangeabilityPercent,
  }
}

export function getInterchangeabilityAdminGuidance(input: {
  stats: InterchangeabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect interchangeability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial interchangeability coverage and refresh the interchangeability summary.'
  }

  if (input.stats.interchangeabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage interchangeability below the 95% target and refresh the interchangeability summary.'
  }

  return 'Workspace owners and admins can inspect workspace interchangeability coverage and refresh the interchangeability summary.'
}

export function resolveInterchangeabilityAdminActions(): InterchangeabilityAdminAction[] {
  return ['refresh_interchangeability_summary']
}
