import type {
  RiskizabilityAdminAction,
  RiskizabilityAdminRecord,
  RiskizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRiskizabilityDomainInventory = {
  domain: RiskizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRiskizabilityAdminRecords(
  inventory: WorkspaceRiskizabilityDomainInventory[],
): RiskizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRiskizabilityAdminStats(input: {
  records: RiskizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RiskizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const riskizabilityPercent =
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
    riskizabilityPercent,
  }
}

export function getRiskizabilityAdminGuidance(input: {
  stats: RiskizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect riskizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial riskizability coverage and refresh the riskizability summary.'
  }

  if (input.stats.riskizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice riskizability below the 95% target and refresh the riskizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace riskizability coverage and refresh the riskizability summary.'
}

export function resolveRiskizabilityAdminActions(): RiskizabilityAdminAction[] {
  return ['refresh_riskizability_summary']
}
