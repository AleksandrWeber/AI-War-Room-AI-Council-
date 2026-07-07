import type {
  CompliancejournalizabilityAdminAction,
  CompliancejournalizabilityAdminRecord,
  CompliancejournalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCompliancejournalizabilityDomainInventory = {
  domain: CompliancejournalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCompliancejournalizabilityAdminRecords(
  inventory: WorkspaceCompliancejournalizabilityDomainInventory[],
): CompliancejournalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCompliancejournalizabilityAdminStats(input: {
  records: CompliancejournalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CompliancejournalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const compliancejournalizabilityPercent =
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
    compliancejournalizabilityPercent,
  }
}

export function getCompliancejournalizabilityAdminGuidance(input: {
  stats: CompliancejournalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect compliancejournalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial compliancejournalizability coverage and refresh the compliancejournalizability summary.'
  }

  if (input.stats.compliancejournalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice compliancejournalizability below the 95% target and refresh the compliancejournalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace compliancejournalizability coverage and refresh the compliancejournalizability summary.'
}

export function resolveCompliancejournalizabilityAdminActions(): CompliancejournalizabilityAdminAction[] {
  return ['refresh_compliancejournalizability_summary']
}
