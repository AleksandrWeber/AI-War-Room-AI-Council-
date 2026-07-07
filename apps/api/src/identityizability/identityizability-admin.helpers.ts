import type {
  IdentityizabilityAdminAction,
  IdentityizabilityAdminRecord,
  IdentityizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIdentityizabilityDomainInventory = {
  domain: IdentityizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIdentityizabilityAdminRecords(
  inventory: WorkspaceIdentityizabilityDomainInventory[],
): IdentityizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIdentityizabilityAdminStats(input: {
  records: IdentityizabilityAdminRecord[]
  postgresConnectivity: boolean
}): IdentityizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const identityizabilityPercent =
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
    identityizabilityPercent,
  }
}

export function getIdentityizabilityAdminGuidance(input: {
  stats: IdentityizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect identityizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial identityizability coverage and refresh the identityizability summary.'
  }

  if (input.stats.identityizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification identityizability below the 95% target and refresh the identityizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace identityizability coverage and refresh the identityizability summary.'
}

export function resolveIdentityizabilityAdminActions(): IdentityizabilityAdminAction[] {
  return ['refresh_identityizability_summary']
}
