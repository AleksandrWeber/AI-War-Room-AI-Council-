import type {
  RetentionizabilityAdminAction,
  RetentionizabilityAdminRecord,
  RetentionizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRetentionizabilityDomainInventory = {
  domain: RetentionizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRetentionizabilityAdminRecords(
  inventory: WorkspaceRetentionizabilityDomainInventory[],
): RetentionizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRetentionizabilityAdminStats(input: {
  records: RetentionizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RetentionizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const retentionizabilityPercent =
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
    retentionizabilityPercent,
  }
}

export function getRetentionizabilityAdminGuidance(input: {
  stats: RetentionizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect retentionizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial retentionizability coverage and refresh the retentionizability summary.'
  }

  if (input.stats.retentionizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification retentionizability below the 95% target and refresh the retentionizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace retentionizability coverage and refresh the retentionizability summary.'
}

export function resolveRetentionizabilityAdminActions(): RetentionizabilityAdminAction[] {
  return ['refresh_retentionizability_summary']
}
