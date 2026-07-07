import type {
  AuditproofizabilityAdminAction,
  AuditproofizabilityAdminRecord,
  AuditproofizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAuditproofizabilityDomainInventory = {
  domain: AuditproofizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAuditproofizabilityAdminRecords(
  inventory: WorkspaceAuditproofizabilityDomainInventory[],
): AuditproofizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAuditproofizabilityAdminStats(input: {
  records: AuditproofizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AuditproofizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const auditproofizabilityPercent =
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
    auditproofizabilityPercent,
  }
}

export function getAuditproofizabilityAdminGuidance(input: {
  stats: AuditproofizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect auditproofizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial auditproofizability coverage and refresh the auditproofizability summary.'
  }

  if (input.stats.auditproofizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification auditproofizability below the 95% target and refresh the auditproofizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace auditproofizability coverage and refresh the auditproofizability summary.'
}

export function resolveAuditproofizabilityAdminActions(): AuditproofizabilityAdminAction[] {
  return ['refresh_auditproofizability_summary']
}
