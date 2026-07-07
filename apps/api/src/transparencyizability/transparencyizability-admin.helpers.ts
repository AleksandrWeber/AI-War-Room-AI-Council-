import type {
  TransparencyizabilityAdminAction,
  TransparencyizabilityAdminRecord,
  TransparencyizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTransparencyizabilityDomainInventory = {
  domain: TransparencyizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTransparencyizabilityAdminRecords(
  inventory: WorkspaceTransparencyizabilityDomainInventory[],
): TransparencyizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTransparencyizabilityAdminStats(input: {
  records: TransparencyizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TransparencyizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const transparencyizabilityPercent =
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
    transparencyizabilityPercent,
  }
}

export function getTransparencyizabilityAdminGuidance(input: {
  stats: TransparencyizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect transparencyizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial transparencyizability coverage and refresh the transparencyizability summary.'
  }

  if (input.stats.transparencyizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key transparencyizability below the 95% target and refresh the transparencyizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace transparencyizability coverage and refresh the transparencyizability summary.'
}

export function resolveTransparencyizabilityAdminActions(): TransparencyizabilityAdminAction[] {
  return ['refresh_transparencyizability_summary']
}
