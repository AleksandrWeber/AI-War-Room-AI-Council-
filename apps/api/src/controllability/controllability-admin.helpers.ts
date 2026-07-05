import type {
  ControllabilityAdminAction,
  ControllabilityAdminRecord,
  ControllabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceControllabilityDomainInventory = {
  domain: ControllabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildControllabilityAdminRecords(
  inventory: WorkspaceControllabilityDomainInventory[],
): ControllabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildControllabilityAdminStats(input: {
  records: ControllabilityAdminRecord[]
  postgresConnectivity: boolean
}): ControllabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const controllabilityPercent =
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
    controllabilityPercent,
  }
}

export function getControllabilityAdminGuidance(input: {
  stats: ControllabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect controllability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial controllability coverage and refresh the controllability summary.'
  }

  if (input.stats.controllabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key controllability below the 95% target and refresh the controllability summary.'
  }

  return 'Workspace owners and admins can inspect workspace controllability coverage and refresh the controllability summary.'
}

export function resolveControllabilityAdminActions(): ControllabilityAdminAction[] {
  return ['refresh_controllability_summary']
}
