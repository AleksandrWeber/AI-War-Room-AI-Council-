import type {
  IdentityproofizabilityAdminAction,
  IdentityproofizabilityAdminRecord,
  IdentityproofizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIdentityproofizabilityDomainInventory = {
  domain: IdentityproofizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIdentityproofizabilityAdminRecords(
  inventory: WorkspaceIdentityproofizabilityDomainInventory[],
): IdentityproofizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIdentityproofizabilityAdminStats(input: {
  records: IdentityproofizabilityAdminRecord[]
  postgresConnectivity: boolean
}): IdentityproofizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const identityproofizabilityPercent =
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
    identityproofizabilityPercent,
  }
}

export function getIdentityproofizabilityAdminGuidance(input: {
  stats: IdentityproofizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect identityproofizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial identityproofizability coverage and refresh the identityproofizability summary.'
  }

  if (input.stats.identityproofizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice identityproofizability below the 95% target and refresh the identityproofizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace identityproofizability coverage and refresh the identityproofizability summary.'
}

export function resolveIdentityproofizabilityAdminActions(): IdentityproofizabilityAdminAction[] {
  return ['refresh_identityproofizability_summary']
}
