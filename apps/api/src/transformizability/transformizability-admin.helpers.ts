import type {
  TransformizabilityAdminAction,
  TransformizabilityAdminRecord,
  TransformizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTransformizabilityDomainInventory = {
  domain: TransformizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTransformizabilityAdminRecords(
  inventory: WorkspaceTransformizabilityDomainInventory[],
): TransformizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTransformizabilityAdminStats(input: {
  records: TransformizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TransformizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const transformizabilityPercent =
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
    transformizabilityPercent,
  }
}

export function getTransformizabilityAdminGuidance(input: {
  stats: TransformizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect transformizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial transformizability coverage and refresh the transformizability summary.'
  }

  if (input.stats.transformizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook transformizability below the 95% target and refresh the transformizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace transformizability coverage and refresh the transformizability summary.'
}

export function resolveTransformizabilityAdminActions(): TransformizabilityAdminAction[] {
  return ['refresh_transformizability_summary']
}
