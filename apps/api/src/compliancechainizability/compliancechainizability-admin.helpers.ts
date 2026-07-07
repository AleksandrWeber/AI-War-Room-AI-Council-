import type {
  CompliancechainizabilityAdminAction,
  CompliancechainizabilityAdminRecord,
  CompliancechainizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCompliancechainizabilityDomainInventory = {
  domain: CompliancechainizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCompliancechainizabilityAdminRecords(
  inventory: WorkspaceCompliancechainizabilityDomainInventory[],
): CompliancechainizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCompliancechainizabilityAdminStats(input: {
  records: CompliancechainizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CompliancechainizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const compliancechainizabilityPercent =
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
    compliancechainizabilityPercent,
  }
}

export function getCompliancechainizabilityAdminGuidance(input: {
  stats: CompliancechainizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect compliancechainizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial compliancechainizability coverage and refresh the compliancechainizability summary.'
  }

  if (input.stats.compliancechainizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice compliancechainizability below the 95% target and refresh the compliancechainizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace compliancechainizability coverage and refresh the compliancechainizability summary.'
}

export function resolveCompliancechainizabilityAdminActions(): CompliancechainizabilityAdminAction[] {
  return ['refresh_compliancechainizability_summary']
}
