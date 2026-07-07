import type {
  ComplianceproofizabilityAdminAction,
  ComplianceproofizabilityAdminRecord,
  ComplianceproofizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceComplianceproofizabilityDomainInventory = {
  domain: ComplianceproofizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildComplianceproofizabilityAdminRecords(
  inventory: WorkspaceComplianceproofizabilityDomainInventory[],
): ComplianceproofizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildComplianceproofizabilityAdminStats(input: {
  records: ComplianceproofizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ComplianceproofizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const complianceproofizabilityPercent =
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
    complianceproofizabilityPercent,
  }
}

export function getComplianceproofizabilityAdminGuidance(input: {
  stats: ComplianceproofizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect complianceproofizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial complianceproofizability coverage and refresh the complianceproofizability summary.'
  }

  if (input.stats.complianceproofizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification complianceproofizability below the 95% target and refresh the complianceproofizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace complianceproofizability coverage and refresh the complianceproofizability summary.'
}

export function resolveComplianceproofizabilityAdminActions(): ComplianceproofizabilityAdminAction[] {
  return ['refresh_complianceproofizability_summary']
}
