import type {
  AssessabilityAdminAction,
  AssessabilityAdminRecord,
  AssessabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAssessabilityDomainInventory = {
  domain: AssessabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAssessabilityAdminRecords(
  inventory: WorkspaceAssessabilityDomainInventory[],
): AssessabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAssessabilityAdminStats(input: {
  records: AssessabilityAdminRecord[]
  postgresConnectivity: boolean
}): AssessabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const assessabilityPercent =
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
    assessabilityPercent,
  }
}

export function getAssessabilityAdminGuidance(input: {
  stats: AssessabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect assessability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial assessability coverage and refresh the assessability summary.'
  }

  if (input.stats.assessabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health assessability below the 95% target and refresh the assessability summary.'
  }

  return 'Workspace owners and admins can inspect workspace assessability coverage and refresh the assessability summary.'
}

export function resolveAssessabilityAdminActions(): AssessabilityAdminAction[] {
  return ['refresh_assessability_summary']
}
