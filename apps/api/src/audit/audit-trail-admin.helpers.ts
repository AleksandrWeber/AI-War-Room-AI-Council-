import type {
  AuditTrailAdminAction,
  AuditTrailAdminRecord,
  AuditTrailAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAuditDomainInventory = {
  domain: AuditTrailAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAuditTrailAdminRecords(
  inventory: WorkspaceAuditDomainInventory[],
): AuditTrailAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAuditTrailAdminStats(input: {
  records: AuditTrailAdminRecord[]
  postgresConnectivity: boolean
}): AuditTrailAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    supportsWorkspaceAuditExport: true,
  }
}

export function getAuditTrailAdminGuidance(input: { stats: AuditTrailAdminStats }) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect audit metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial audit coverage and refresh the audit summary.'
  }

  return 'Workspace owners and admins can inspect workspace audit coverage and refresh the audit summary.'
}

export function resolveAuditTrailAdminActions(): AuditTrailAdminAction[] {
  return ['refresh_audit_summary']
}
