import type {
  PredictizabilityAdminAction,
  PredictizabilityAdminRecord,
  PredictizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePredictizabilityDomainInventory = {
  domain: PredictizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPredictizabilityAdminRecords(
  inventory: WorkspacePredictizabilityDomainInventory[],
): PredictizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPredictizabilityAdminStats(input: {
  records: PredictizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PredictizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const predictizabilityPercent =
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
    predictizabilityPercent,
  }
}

export function getPredictizabilityAdminGuidance(input: {
  stats: PredictizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect predictizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial predictizability coverage and refresh the predictizability summary.'
  }

  if (input.stats.predictizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential predictizability below the 95% target and refresh the predictizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace predictizability coverage and refresh the predictizability summary.'
}

export function resolvePredictizabilityAdminActions(): PredictizabilityAdminAction[] {
  return ['refresh_predictizability_summary']
}
