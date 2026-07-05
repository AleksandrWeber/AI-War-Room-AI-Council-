import type {
  DetectabilityAdminAction,
  DetectabilityAdminRecord,
  DetectabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDetectabilityDomainInventory = {
  domain: DetectabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDetectabilityAdminRecords(
  inventory: WorkspaceDetectabilityDomainInventory[],
): DetectabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDetectabilityAdminStats(input: {
  records: DetectabilityAdminRecord[]
  postgresConnectivity: boolean
}): DetectabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const detectabilityPercent =
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
    detectabilityPercent,
  }
}

export function getDetectabilityAdminGuidance(input: {
  stats: DetectabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect detectability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial detectability coverage and refresh the detectability summary.'
  }

  if (input.stats.detectabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook detectability below the 95% target and refresh the detectability summary.'
  }

  return 'Workspace owners and admins can inspect workspace detectability coverage and refresh the detectability summary.'
}

export function resolveDetectabilityAdminActions(): DetectabilityAdminAction[] {
  return ['refresh_detectability_summary']
}
