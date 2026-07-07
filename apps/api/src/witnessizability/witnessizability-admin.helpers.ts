import type {
  WitnessizabilityAdminAction,
  WitnessizabilityAdminRecord,
  WitnessizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceWitnessizabilityDomainInventory = {
  domain: WitnessizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildWitnessizabilityAdminRecords(
  inventory: WorkspaceWitnessizabilityDomainInventory[],
): WitnessizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildWitnessizabilityAdminStats(input: {
  records: WitnessizabilityAdminRecord[]
  postgresConnectivity: boolean
}): WitnessizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const witnessizabilityPercent =
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
    witnessizabilityPercent,
  }
}

export function getWitnessizabilityAdminGuidance(input: {
  stats: WitnessizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect witnessizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial witnessizability coverage and refresh the witnessizability summary.'
  }

  if (input.stats.witnessizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key witnessizability below the 95% target and refresh the witnessizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace witnessizability coverage and refresh the witnessizability summary.'
}

export function resolveWitnessizabilityAdminActions(): WitnessizabilityAdminAction[] {
  return ['refresh_witnessizability_summary']
}
