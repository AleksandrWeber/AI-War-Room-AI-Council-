import type {
  CompliancevaultizabilityAdminAction,
  CompliancevaultizabilityAdminRecord,
  CompliancevaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCompliancevaultizabilityDomainInventory = {
  domain: CompliancevaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCompliancevaultizabilityAdminRecords(
  inventory: WorkspaceCompliancevaultizabilityDomainInventory[],
): CompliancevaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCompliancevaultizabilityAdminStats(input: {
  records: CompliancevaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CompliancevaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const compliancevaultizabilityPercent =
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
    compliancevaultizabilityPercent,
  }
}

export function getCompliancevaultizabilityAdminGuidance(input: {
  stats: CompliancevaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect compliancevaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial compliancevaultizability coverage and refresh the compliancevaultizability summary.'
  }

  if (input.stats.compliancevaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification compliancevaultizability below the 95% target and refresh the compliancevaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace compliancevaultizability coverage and refresh the compliancevaultizability summary.'
}

export function resolveCompliancevaultizabilityAdminActions(): CompliancevaultizabilityAdminAction[] {
  return ['refresh_compliancevaultizability_summary']
}
