import type {
  TrustizabilityAdminAction,
  TrustizabilityAdminRecord,
  TrustizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTrustizabilityDomainInventory = {
  domain: TrustizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTrustizabilityAdminRecords(
  inventory: WorkspaceTrustizabilityDomainInventory[],
): TrustizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTrustizabilityAdminStats(input: {
  records: TrustizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TrustizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const trustizabilityPercent =
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
    trustizabilityPercent,
  }
}

export function getTrustizabilityAdminGuidance(input: {
  stats: TrustizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect trustizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial trustizability coverage and refresh the trustizability summary.'
  }

  if (input.stats.trustizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan trustizability below the 95% target and refresh the trustizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace trustizability coverage and refresh the trustizability summary.'
}

export function resolveTrustizabilityAdminActions(): TrustizabilityAdminAction[] {
  return ['refresh_trustizability_summary']
}
