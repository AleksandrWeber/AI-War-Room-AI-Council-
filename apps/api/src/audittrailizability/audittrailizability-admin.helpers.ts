import type {
  AudittrailizabilityAdminAction,
  AudittrailizabilityAdminRecord,
  AudittrailizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAudittrailizabilityDomainInventory = {
  domain: AudittrailizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAudittrailizabilityAdminRecords(
  inventory: WorkspaceAudittrailizabilityDomainInventory[],
): AudittrailizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAudittrailizabilityAdminStats(input: {
  records: AudittrailizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AudittrailizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const audittrailizabilityPercent =
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
    audittrailizabilityPercent,
  }
}

export function getAudittrailizabilityAdminGuidance(input: {
  stats: AudittrailizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect audittrailizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial audittrailizability coverage and refresh the audittrailizability summary.'
  }

  if (input.stats.audittrailizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan audittrailizability below the 95% target and refresh the audittrailizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace audittrailizability coverage and refresh the audittrailizability summary.'
}

export function resolveAudittrailizabilityAdminActions(): AudittrailizabilityAdminAction[] {
  return ['refresh_audittrailizability_summary']
}
