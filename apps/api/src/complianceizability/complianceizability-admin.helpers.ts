import type {
  ComplianceizabilityAdminAction,
  ComplianceizabilityAdminRecord,
  ComplianceizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceComplianceizabilityDomainInventory = {
  domain: ComplianceizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildComplianceizabilityAdminRecords(
  inventory: WorkspaceComplianceizabilityDomainInventory[],
): ComplianceizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildComplianceizabilityAdminStats(input: {
  records: ComplianceizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ComplianceizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const complianceizabilityPercent =
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
    complianceizabilityPercent,
  }
}

export function getComplianceizabilityAdminGuidance(input: {
  stats: ComplianceizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect complianceizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial complianceizability coverage and refresh the complianceizability summary.'
  }

  if (input.stats.complianceizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice complianceizability below the 95% target and refresh the complianceizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace complianceizability coverage and refresh the complianceizability summary.'
}

export function resolveComplianceizabilityAdminActions(): ComplianceizabilityAdminAction[] {
  return ['refresh_complianceizability_summary']
}
