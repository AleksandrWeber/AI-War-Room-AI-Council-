import type {
  AccountabilityizabilityAdminAction,
  AccountabilityizabilityAdminRecord,
  AccountabilityizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAccountabilityizabilityDomainInventory = {
  domain: AccountabilityizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAccountabilityizabilityAdminRecords(
  inventory: WorkspaceAccountabilityizabilityDomainInventory[],
): AccountabilityizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAccountabilityizabilityAdminStats(input: {
  records: AccountabilityizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AccountabilityizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const accountabilityizabilityPercent =
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
    accountabilityizabilityPercent,
  }
}

export function getAccountabilityizabilityAdminGuidance(input: {
  stats: AccountabilityizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect accountabilityizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial accountabilityizability coverage and refresh the accountabilityizability summary.'
  }

  if (input.stats.accountabilityizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership accountabilityizability below the 95% target and refresh the accountabilityizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace accountabilityizability coverage and refresh the accountabilityizability summary.'
}

export function resolveAccountabilityizabilityAdminActions(): AccountabilityizabilityAdminAction[] {
  return ['refresh_accountabilityizability_summary']
}
