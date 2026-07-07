import type {
  ComplianceledgerizabilityAdminAction,
  ComplianceledgerizabilityAdminRecord,
  ComplianceledgerizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceComplianceledgerizabilityDomainInventory = {
  domain: ComplianceledgerizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildComplianceledgerizabilityAdminRecords(
  inventory: WorkspaceComplianceledgerizabilityDomainInventory[],
): ComplianceledgerizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildComplianceledgerizabilityAdminStats(input: {
  records: ComplianceledgerizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ComplianceledgerizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const complianceledgerizabilityPercent =
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
    complianceledgerizabilityPercent,
  }
}

export function getComplianceledgerizabilityAdminGuidance(input: {
  stats: ComplianceledgerizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect complianceledgerizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial complianceledgerizability coverage and refresh the complianceledgerizability summary.'
  }

  if (input.stats.complianceledgerizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice complianceledgerizability below the 95% target and refresh the complianceledgerizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace complianceledgerizability coverage and refresh the complianceledgerizability summary.'
}

export function resolveComplianceledgerizabilityAdminActions(): ComplianceledgerizabilityAdminAction[] {
  return ['refresh_complianceledgerizability_summary']
}
