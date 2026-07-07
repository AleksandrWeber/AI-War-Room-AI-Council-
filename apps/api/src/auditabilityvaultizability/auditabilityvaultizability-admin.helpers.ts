import type {
  AuditabilityvaultizabilityAdminAction,
  AuditabilityvaultizabilityAdminRecord,
  AuditabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAuditabilityvaultizabilityDomainInventory = {
  domain: AuditabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAuditabilityvaultizabilityAdminRecords(
  inventory: WorkspaceAuditabilityvaultizabilityDomainInventory[],
): AuditabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAuditabilityvaultizabilityAdminStats(input: {
  records: AuditabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AuditabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const auditabilityvaultizabilityPercent =
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
    auditabilityvaultizabilityPercent,
  }
}

export function getAuditabilityvaultizabilityAdminGuidance(input: {
  stats: AuditabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect auditabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial auditabilityvaultizability coverage and refresh the auditabilityvaultizability summary.'
  }

  if (input.stats.auditabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership auditabilityvaultizability below the 95% target and refresh the auditabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace auditabilityvaultizability coverage and refresh the auditabilityvaultizability summary.'
}

export function resolveAuditabilityvaultizabilityAdminActions(): AuditabilityvaultizabilityAdminAction[] {
  return ['refresh_auditabilityvaultizability_summary']
}
