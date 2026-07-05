import type {
  PipeliningizabilityAdminAction,
  PipeliningizabilityAdminRecord,
  PipeliningizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePipeliningizabilityDomainInventory = {
  domain: PipeliningizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPipeliningizabilityAdminRecords(
  inventory: WorkspacePipeliningizabilityDomainInventory[],
): PipeliningizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPipeliningizabilityAdminStats(input: {
  records: PipeliningizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PipeliningizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const pipeliningizabilityPercent =
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
    pipeliningizabilityPercent,
  }
}

export function getPipeliningizabilityAdminGuidance(input: {
  stats: PipeliningizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect pipeliningizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial pipeliningizability coverage and refresh the pipeliningizability summary.'
  }

  if (input.stats.pipeliningizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key pipeliningizability below the 95% target and refresh the pipeliningizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace pipeliningizability coverage and refresh the pipeliningizability summary.'
}

export function resolvePipeliningizabilityAdminActions(): PipeliningizabilityAdminAction[] {
  return ['refresh_pipeliningizability_summary']
}
