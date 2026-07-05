import type {
  FeatureflagizabilityAdminAction,
  FeatureflagizabilityAdminRecord,
  FeatureflagizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceFeatureflagizabilityDomainInventory = {
  domain: FeatureflagizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildFeatureflagizabilityAdminRecords(
  inventory: WorkspaceFeatureflagizabilityDomainInventory[],
): FeatureflagizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildFeatureflagizabilityAdminStats(input: {
  records: FeatureflagizabilityAdminRecord[]
  postgresConnectivity: boolean
}): FeatureflagizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const featureflagizabilityPercent =
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
    featureflagizabilityPercent,
  }
}

export function getFeatureflagizabilityAdminGuidance(input: {
  stats: FeatureflagizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect featureflagizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial featureflagizability coverage and refresh the featureflagizability summary.'
  }

  if (input.stats.featureflagizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health featureflagizability below the 95% target and refresh the featureflagizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace featureflagizability coverage and refresh the featureflagizability summary.'
}

export function resolveFeatureflagizabilityAdminActions(): FeatureflagizabilityAdminAction[] {
  return ['refresh_featureflagizability_summary']
}
