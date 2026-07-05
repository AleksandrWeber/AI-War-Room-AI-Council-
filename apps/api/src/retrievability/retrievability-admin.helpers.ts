import type {
  RetrievabilityAdminAction,
  RetrievabilityAdminRecord,
  RetrievabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRetrievabilityDomainInventory = {
  domain: RetrievabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRetrievabilityAdminRecords(
  inventory: WorkspaceRetrievabilityDomainInventory[],
): RetrievabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRetrievabilityAdminStats(input: {
  records: RetrievabilityAdminRecord[]
  postgresConnectivity: boolean
}): RetrievabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const retrievabilityPercent =
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
    retrievabilityPercent,
  }
}

export function getRetrievabilityAdminGuidance(input: {
  stats: RetrievabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect retrievability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial retrievability coverage and refresh the retrievability summary.'
  }

  if (input.stats.retrievabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan retrievability below the 95% target and refresh the retrievability summary.'
  }

  return 'Workspace owners and admins can inspect workspace retrievability coverage and refresh the retrievability summary.'
}

export function resolveRetrievabilityAdminActions(): RetrievabilityAdminAction[] {
  return ['refresh_retrievability_summary']
}
