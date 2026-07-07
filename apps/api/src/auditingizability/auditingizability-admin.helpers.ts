import type {
  AuditingizabilityAdminAction,
  AuditingizabilityAdminRecord,
  AuditingizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAuditingizabilityDomainInventory = {
  domain: AuditingizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAuditingizabilityAdminRecords(
  inventory: WorkspaceAuditingizabilityDomainInventory[],
): AuditingizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAuditingizabilityAdminStats(input: {
  records: AuditingizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AuditingizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const auditingizabilityPercent =
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
    auditingizabilityPercent,
  }
}

export function getAuditingizabilityAdminGuidance(input: {
  stats: AuditingizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect auditingizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial auditingizability coverage and refresh the auditingizability summary.'
  }

  if (input.stats.auditingizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice auditingizability below the 95% target and refresh the auditingizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace auditingizability coverage and refresh the auditingizability summary.'
}

export function resolveAuditingizabilityAdminActions(): AuditingizabilityAdminAction[] {
  return ['refresh_auditingizability_summary']
}
