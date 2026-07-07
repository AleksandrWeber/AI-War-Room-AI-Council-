import type {
  PredictabilityvaultizabilityAdminAction,
  PredictabilityvaultizabilityAdminRecord,
  PredictabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePredictabilityvaultizabilityDomainInventory = {
  domain: PredictabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPredictabilityvaultizabilityAdminRecords(
  inventory: WorkspacePredictabilityvaultizabilityDomainInventory[],
): PredictabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPredictabilityvaultizabilityAdminStats(input: {
  records: PredictabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PredictabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const predictabilityvaultizabilityPercent =
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
    predictabilityvaultizabilityPercent,
  }
}

export function getPredictabilityvaultizabilityAdminGuidance(input: {
  stats: PredictabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect predictabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial predictabilityvaultizability coverage and refresh the predictabilityvaultizability summary.'
  }

  if (input.stats.predictabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification predictabilityvaultizability below the 95% target and refresh the predictabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace predictabilityvaultizability coverage and refresh the predictabilityvaultizability summary.'
}

export function resolvePredictabilityvaultizabilityAdminActions(): PredictabilityvaultizabilityAdminAction[] {
  return ['refresh_predictabilityvaultizability_summary']
}
