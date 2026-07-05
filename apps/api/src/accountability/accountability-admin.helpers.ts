import type {
  AccountabilityAdminAction,
  AccountabilityAdminRecord,
  AccountabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAccountabilityDomainInventory = {
  domain: AccountabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAccountabilityAdminRecords(
  inventory: WorkspaceAccountabilityDomainInventory[],
): AccountabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAccountabilityAdminStats(input: {
  records: AccountabilityAdminRecord[]
  postgresConnectivity: boolean
}): AccountabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const idempotencyKeys =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const accountabilityPercent =
    completedRuns === 0
      ? 100
      : Math.min(100, Math.round((idempotencyKeys / completedRuns) * 100))

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    accountabilityPercent,
  }
}

export function getAccountabilityAdminGuidance(input: {
  stats: AccountabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect accountability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial accountability coverage and refresh the accountability summary.'
  }

  if (input.stats.accountabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency accountability below the 95% target and refresh the accountability summary.'
  }

  return 'Workspace owners and admins can inspect workspace accountability coverage and refresh the accountability summary.'
}

export function resolveAccountabilityAdminActions(): AccountabilityAdminAction[] {
  return ['refresh_accountability_summary']
}
