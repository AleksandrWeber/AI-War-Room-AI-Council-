import type {
  ExplainabilityAdminAction,
  ExplainabilityAdminRecord,
  ExplainabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceExplainabilityDomainInventory = {
  domain: ExplainabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildExplainabilityAdminRecords(
  inventory: WorkspaceExplainabilityDomainInventory[],
): ExplainabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildExplainabilityAdminStats(input: {
  records: ExplainabilityAdminRecord[]
  postgresConnectivity: boolean
}): ExplainabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'moderator_syntheses')
      ?.recordCount ?? 0
  const explainabilityPercent =
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
    explainabilityPercent,
  }
}

export function getExplainabilityAdminGuidance(input: {
  stats: ExplainabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect explainability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial explainability coverage and refresh the explainability summary.'
  }

  if (input.stats.explainabilityPercent < 95) {
    return 'Workspace owners and admins can inspect moderator synthesis explainability below the 95% target and refresh the explainability summary.'
  }

  return 'Workspace owners and admins can inspect workspace explainability coverage and refresh the explainability summary.'
}

export function resolveExplainabilityAdminActions(): ExplainabilityAdminAction[] {
  return ['refresh_explainability_summary']
}
