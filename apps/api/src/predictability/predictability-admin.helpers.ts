import type {
  PredictabilityAdminAction,
  PredictabilityAdminRecord,
  PredictabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePredictabilityDomainInventory = {
  domain: PredictabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPredictabilityAdminRecords(
  inventory: WorkspacePredictabilityDomainInventory[],
): PredictabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPredictabilityAdminStats(input: {
  records: PredictabilityAdminRecord[]
  postgresConnectivity: boolean
}): PredictabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'moderator_syntheses')
      ?.recordCount ?? 0
  const predictabilityPercent =
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
    predictabilityPercent,
  }
}

export function getPredictabilityAdminGuidance(input: {
  stats: PredictabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect predictability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial predictability coverage and refresh the predictability summary.'
  }

  if (input.stats.predictabilityPercent < 95) {
    return 'Workspace owners and admins can inspect moderator synthesis predictability below the 95% target and refresh the predictability summary.'
  }

  return 'Workspace owners and admins can inspect workspace predictability coverage and refresh the predictability summary.'
}

export function resolvePredictabilityAdminActions(): PredictabilityAdminAction[] {
  return ['refresh_predictability_summary']
}
