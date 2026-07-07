import type {
  AuthenticityvaultizabilityAdminAction,
  AuthenticityvaultizabilityAdminRecord,
  AuthenticityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAuthenticityvaultizabilityDomainInventory = {
  domain: AuthenticityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAuthenticityvaultizabilityAdminRecords(
  inventory: WorkspaceAuthenticityvaultizabilityDomainInventory[],
): AuthenticityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAuthenticityvaultizabilityAdminStats(input: {
  records: AuthenticityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AuthenticityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const authenticityvaultizabilityPercent =
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
    authenticityvaultizabilityPercent,
  }
}

export function getAuthenticityvaultizabilityAdminGuidance(input: {
  stats: AuthenticityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect authenticityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial authenticityvaultizability coverage and refresh the authenticityvaultizability summary.'
  }

  if (input.stats.authenticityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership authenticityvaultizability below the 95% target and refresh the authenticityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace authenticityvaultizability coverage and refresh the authenticityvaultizability summary.'
}

export function resolveAuthenticityvaultizabilityAdminActions(): AuthenticityvaultizabilityAdminAction[] {
  return ['refresh_authenticityvaultizability_summary']
}
