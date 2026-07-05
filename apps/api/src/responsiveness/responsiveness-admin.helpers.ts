import type {
  ResponsivenessAdminAction,
  ResponsivenessAdminRecord,
  ResponsivenessAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceResponsivenessDomainInventory = {
  domain: ResponsivenessAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildResponsivenessAdminRecords(
  inventory: WorkspaceResponsivenessDomainInventory[],
): ResponsivenessAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildResponsivenessAdminStats(input: {
  records: ResponsivenessAdminRecord[]
  postgresConnectivity: boolean
}): ResponsivenessAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'usage_events')
      ?.recordCount ?? 0
  const responsivenessPercent =
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
    responsivenessPercent,
  }
}

export function getResponsivenessAdminGuidance(input: {
  stats: ResponsivenessAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect responsiveness metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial responsiveness coverage and refresh the responsiveness summary.'
  }

  if (input.stats.responsivenessPercent < 95) {
    return 'Workspace owners and admins can inspect usage event responsiveness below the 95% target and refresh the responsiveness summary.'
  }

  return 'Workspace owners and admins can inspect workspace responsiveness coverage and refresh the responsiveness summary.'
}

export function resolveResponsivenessAdminActions(): ResponsivenessAdminAction[] {
  return ['refresh_responsiveness_summary']
}
