import type {
  AuditregistryizabilityAdminAction,
  AuditregistryizabilityAdminRecord,
  AuditregistryizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAuditregistryizabilityDomainInventory = {
  domain: AuditregistryizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAuditregistryizabilityAdminRecords(
  inventory: WorkspaceAuditregistryizabilityDomainInventory[],
): AuditregistryizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAuditregistryizabilityAdminStats(input: {
  records: AuditregistryizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AuditregistryizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const auditregistryizabilityPercent =
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
    auditregistryizabilityPercent,
  }
}

export function getAuditregistryizabilityAdminGuidance(input: {
  stats: AuditregistryizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect auditregistryizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial auditregistryizability coverage and refresh the auditregistryizability summary.'
  }

  if (input.stats.auditregistryizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification auditregistryizability below the 95% target and refresh the auditregistryizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace auditregistryizability coverage and refresh the auditregistryizability summary.'
}

export function resolveAuditregistryizabilityAdminActions(): AuditregistryizabilityAdminAction[] {
  return ['refresh_auditregistryizability_summary']
}
