import type {
  ComplianceAdminAction,
  ComplianceAdminRecord,
  ComplianceAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceComplianceDomainInventory = {
  domain: ComplianceAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildComplianceAdminRecords(
  inventory: WorkspaceComplianceDomainInventory[],
): ComplianceAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildComplianceAdminStats(input: {
  records: ComplianceAdminRecord[]
  postgresConnectivity: boolean
  encryptionKeyConfigured: boolean
}): ComplianceAdminStats {
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
    encryptionKeyConfigured: input.encryptionKeyConfigured,
  }
}

export function getComplianceAdminGuidance(input: { stats: ComplianceAdminStats }) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect compliance metrics once PostgreSQL connectivity is available.'
  }

  if (!input.stats.encryptionKeyConfigured) {
    return 'Workspace owners and admins can inspect compliance coverage once encryption key readiness is configured.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial compliance coverage and refresh the compliance summary.'
  }

  return 'Workspace owners and admins can inspect workspace compliance coverage and refresh the compliance summary.'
}

export function resolveComplianceAdminActions(): ComplianceAdminAction[] {
  return ['refresh_compliance_summary']
}
