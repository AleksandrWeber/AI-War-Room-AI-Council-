import type {
  ExplainabilityvaultizabilityAdminAction,
  ExplainabilityvaultizabilityAdminRecord,
  ExplainabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceExplainabilityvaultizabilityDomainInventory = {
  domain: ExplainabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildExplainabilityvaultizabilityAdminRecords(
  inventory: WorkspaceExplainabilityvaultizabilityDomainInventory[],
): ExplainabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildExplainabilityvaultizabilityAdminStats(input: {
  records: ExplainabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ExplainabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const explainabilityvaultizabilityPercent =
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
    explainabilityvaultizabilityPercent,
  }
}

export function getExplainabilityvaultizabilityAdminGuidance(input: {
  stats: ExplainabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect explainabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial explainabilityvaultizability coverage and refresh the explainabilityvaultizability summary.'
  }

  if (input.stats.explainabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership explainabilityvaultizability below the 95% target and refresh the explainabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace explainabilityvaultizability coverage and refresh the explainabilityvaultizability summary.'
}

export function resolveExplainabilityvaultizabilityAdminActions(): ExplainabilityvaultizabilityAdminAction[] {
  return ['refresh_explainabilityvaultizability_summary']
}
