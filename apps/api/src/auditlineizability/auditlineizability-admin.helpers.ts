import type {
  AuditlineizabilityAdminAction,
  AuditlineizabilityAdminRecord,
  AuditlineizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAuditlineizabilityDomainInventory = {
  domain: AuditlineizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAuditlineizabilityAdminRecords(
  inventory: WorkspaceAuditlineizabilityDomainInventory[],
): AuditlineizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAuditlineizabilityAdminStats(input: {
  records: AuditlineizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AuditlineizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const auditlineizabilityPercent =
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
    auditlineizabilityPercent,
  }
}

export function getAuditlineizabilityAdminGuidance(input: {
  stats: AuditlineizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect auditlineizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial auditlineizability coverage and refresh the auditlineizability summary.'
  }

  if (input.stats.auditlineizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice auditlineizability below the 95% target and refresh the auditlineizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace auditlineizability coverage and refresh the auditlineizability summary.'
}

export function resolveAuditlineizabilityAdminActions(): AuditlineizabilityAdminAction[] {
  return ['refresh_auditlineizability_summary']
}
