import type {
  VisualizabilityAdminAction,
  VisualizabilityAdminRecord,
  VisualizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceVisualizabilityDomainInventory = {
  domain: VisualizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildVisualizabilityAdminRecords(
  inventory: WorkspaceVisualizabilityDomainInventory[],
): VisualizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildVisualizabilityAdminStats(input: {
  records: VisualizabilityAdminRecord[]
  postgresConnectivity: boolean
}): VisualizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_registry_entries')
      ?.recordCount ?? 0
  const visualizabilityPercent =
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
    visualizabilityPercent,
  }
}

export function getVisualizabilityAdminGuidance(input: {
  stats: VisualizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect visualizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial visualizability coverage and refresh the visualizability summary.'
  }

  if (input.stats.visualizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model registry visualizability below the 95% target and refresh the visualizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace visualizability coverage and refresh the visualizability summary.'
}

export function resolveVisualizabilityAdminActions(): VisualizabilityAdminAction[] {
  return ['refresh_visualizability_summary']
}
