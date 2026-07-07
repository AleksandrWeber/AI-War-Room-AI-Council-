import type {
  ComplianceguardizabilityAdminAction,
  ComplianceguardizabilityAdminRecord,
  ComplianceguardizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceComplianceguardizabilityDomainInventory = {
  domain: ComplianceguardizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildComplianceguardizabilityAdminRecords(
  inventory: WorkspaceComplianceguardizabilityDomainInventory[],
): ComplianceguardizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildComplianceguardizabilityAdminStats(input: {
  records: ComplianceguardizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ComplianceguardizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const complianceguardizabilityPercent =
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
    complianceguardizabilityPercent,
  }
}

export function getComplianceguardizabilityAdminGuidance(input: {
  stats: ComplianceguardizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect complianceguardizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial complianceguardizability coverage and refresh the complianceguardizability summary.'
  }

  if (input.stats.complianceguardizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification complianceguardizability below the 95% target and refresh the complianceguardizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace complianceguardizability coverage and refresh the complianceguardizability summary.'
}

export function resolveComplianceguardizabilityAdminActions(): ComplianceguardizabilityAdminAction[] {
  return ['refresh_complianceguardizability_summary']
}
