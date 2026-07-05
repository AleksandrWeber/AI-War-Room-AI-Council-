import type {
  CompatibilizabilityAdminAction,
  CompatibilizabilityAdminRecord,
  CompatibilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCompatibilizabilityDomainInventory = {
  domain: CompatibilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCompatibilizabilityAdminRecords(
  inventory: WorkspaceCompatibilizabilityDomainInventory[],
): CompatibilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCompatibilizabilityAdminStats(input: {
  records: CompatibilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CompatibilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const compatibilizabilityPercent =
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
    compatibilizabilityPercent,
  }
}

export function getCompatibilizabilityAdminGuidance(input: {
  stats: CompatibilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect compatibilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial compatibilizability coverage and refresh the compatibilizability summary.'
  }

  if (input.stats.compatibilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook compatibilizability below the 95% target and refresh the compatibilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace compatibilizability coverage and refresh the compatibilizability summary.'
}

export function resolveCompatibilizabilityAdminActions(): CompatibilizabilityAdminAction[] {
  return ['refresh_compatibilizability_summary']
}
