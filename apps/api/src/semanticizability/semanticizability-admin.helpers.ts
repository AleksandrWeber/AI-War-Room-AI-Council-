import type {
  SemanticizabilityAdminAction,
  SemanticizabilityAdminRecord,
  SemanticizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSemanticizabilityDomainInventory = {
  domain: SemanticizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSemanticizabilityAdminRecords(
  inventory: WorkspaceSemanticizabilityDomainInventory[],
): SemanticizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSemanticizabilityAdminStats(input: {
  records: SemanticizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SemanticizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const semanticizabilityPercent =
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
    semanticizabilityPercent,
  }
}

export function getSemanticizabilityAdminGuidance(input: {
  stats: SemanticizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect semanticizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial semanticizability coverage and refresh the semanticizability summary.'
  }

  if (input.stats.semanticizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice semanticizability below the 95% target and refresh the semanticizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace semanticizability coverage and refresh the semanticizability summary.'
}

export function resolveSemanticizabilityAdminActions(): SemanticizabilityAdminAction[] {
  return ['refresh_semanticizability_summary']
}
