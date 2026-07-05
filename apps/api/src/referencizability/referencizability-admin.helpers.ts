import type {
  ReferencizabilityAdminAction,
  ReferencizabilityAdminRecord,
  ReferencizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceReferencizabilityDomainInventory = {
  domain: ReferencizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildReferencizabilityAdminRecords(
  inventory: WorkspaceReferencizabilityDomainInventory[],
): ReferencizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildReferencizabilityAdminStats(input: {
  records: ReferencizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ReferencizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const referencizabilityPercent =
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
    referencizabilityPercent,
  }
}

export function getReferencizabilityAdminGuidance(input: {
  stats: ReferencizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect referencizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial referencizability coverage and refresh the referencizability summary.'
  }

  if (input.stats.referencizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key referencizability below the 95% target and refresh the referencizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace referencizability coverage and refresh the referencizability summary.'
}

export function resolveReferencizabilityAdminActions(): ReferencizabilityAdminAction[] {
  return ['refresh_referencizability_summary']
}
