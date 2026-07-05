import type {
  PublishizabilityAdminAction,
  PublishizabilityAdminRecord,
  PublishizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePublishizabilityDomainInventory = {
  domain: PublishizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPublishizabilityAdminRecords(
  inventory: WorkspacePublishizabilityDomainInventory[],
): PublishizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPublishizabilityAdminStats(input: {
  records: PublishizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PublishizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const publishizabilityPercent =
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
    publishizabilityPercent,
  }
}

export function getPublishizabilityAdminGuidance(input: {
  stats: PublishizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect publishizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial publishizability coverage and refresh the publishizability summary.'
  }

  if (input.stats.publishizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage publishizability below the 95% target and refresh the publishizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace publishizability coverage and refresh the publishizability summary.'
}

export function resolvePublishizabilityAdminActions(): PublishizabilityAdminAction[] {
  return ['refresh_publishizability_summary']
}
