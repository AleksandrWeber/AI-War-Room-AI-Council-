import type {
  AuditjournalizabilityAdminAction,
  AuditjournalizabilityAdminRecord,
  AuditjournalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAuditjournalizabilityDomainInventory = {
  domain: AuditjournalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAuditjournalizabilityAdminRecords(
  inventory: WorkspaceAuditjournalizabilityDomainInventory[],
): AuditjournalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAuditjournalizabilityAdminStats(input: {
  records: AuditjournalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AuditjournalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const auditjournalizabilityPercent =
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
    auditjournalizabilityPercent,
  }
}

export function getAuditjournalizabilityAdminGuidance(input: {
  stats: AuditjournalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect auditjournalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial auditjournalizability coverage and refresh the auditjournalizability summary.'
  }

  if (input.stats.auditjournalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification auditjournalizability below the 95% target and refresh the auditjournalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace auditjournalizability coverage and refresh the auditjournalizability summary.'
}

export function resolveAuditjournalizabilityAdminActions(): AuditjournalizabilityAdminAction[] {
  return ['refresh_auditjournalizability_summary']
}
