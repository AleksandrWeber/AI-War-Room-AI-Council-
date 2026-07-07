import type {
  RetrievabilityvaultizabilityAdminAction,
  RetrievabilityvaultizabilityAdminRecord,
  RetrievabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRetrievabilityvaultizabilityDomainInventory = {
  domain: RetrievabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRetrievabilityvaultizabilityAdminRecords(
  inventory: WorkspaceRetrievabilityvaultizabilityDomainInventory[],
): RetrievabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRetrievabilityvaultizabilityAdminStats(input: {
  records: RetrievabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RetrievabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const retrievabilityvaultizabilityPercent =
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
    retrievabilityvaultizabilityPercent,
  }
}

export function getRetrievabilityvaultizabilityAdminGuidance(input: {
  stats: RetrievabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect retrievabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial retrievabilityvaultizability coverage and refresh the retrievabilityvaultizability summary.'
  }

  if (input.stats.retrievabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key retrievabilityvaultizability below the 95% target and refresh the retrievabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace retrievabilityvaultizability coverage and refresh the retrievabilityvaultizability summary.'
}

export function resolveRetrievabilityvaultizabilityAdminActions(): RetrievabilityvaultizabilityAdminAction[] {
  return ['refresh_retrievabilityvaultizability_summary']
}
