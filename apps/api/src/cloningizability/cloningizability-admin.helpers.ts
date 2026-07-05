import type {
  CloningizabilityAdminAction,
  CloningizabilityAdminRecord,
  CloningizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCloningizabilityDomainInventory = {
  domain: CloningizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCloningizabilityAdminRecords(
  inventory: WorkspaceCloningizabilityDomainInventory[],
): CloningizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCloningizabilityAdminStats(input: {
  records: CloningizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CloningizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const cloningizabilityPercent =
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
    cloningizabilityPercent,
  }
}

export function getCloningizabilityAdminGuidance(input: {
  stats: CloningizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect cloningizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial cloningizability coverage and refresh the cloningizability summary.'
  }

  if (input.stats.cloningizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit cloningizability below the 95% target and refresh the cloningizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace cloningizability coverage and refresh the cloningizability summary.'
}

export function resolveCloningizabilityAdminActions(): CloningizabilityAdminAction[] {
  return ['refresh_cloningizability_summary']
}
