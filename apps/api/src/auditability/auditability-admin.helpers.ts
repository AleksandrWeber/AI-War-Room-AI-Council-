import type {
  AuditabilityAdminAction,
  AuditabilityAdminRecord,
  AuditabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAuditabilityDomainInventory = {
  domain: AuditabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAuditabilityAdminRecords(
  inventory: WorkspaceAuditabilityDomainInventory[],
): AuditabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAuditabilityAdminStats(input: {
  records: AuditabilityAdminRecord[]
  postgresConnectivity: boolean
}): AuditabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'usage_events')
      ?.recordCount ?? 0
  const auditabilityPercent =
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
    auditabilityPercent,
  }
}

export function getAuditabilityAdminGuidance(input: {
  stats: AuditabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect auditability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial auditability coverage and refresh the auditability summary.'
  }

  if (input.stats.auditabilityPercent < 95) {
    return 'Workspace owners and admins can inspect usage auditability below the 95% target and refresh the auditability summary.'
  }

  return 'Workspace owners and admins can inspect workspace auditability coverage and refresh the auditability summary.'
}

export function resolveAuditabilityAdminActions(): AuditabilityAdminAction[] {
  return ['refresh_auditability_summary']
}
