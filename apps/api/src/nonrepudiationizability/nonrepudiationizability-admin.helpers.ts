import type {
  NonrepudiationizabilityAdminAction,
  NonrepudiationizabilityAdminRecord,
  NonrepudiationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceNonrepudiationizabilityDomainInventory = {
  domain: NonrepudiationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildNonrepudiationizabilityAdminRecords(
  inventory: WorkspaceNonrepudiationizabilityDomainInventory[],
): NonrepudiationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildNonrepudiationizabilityAdminStats(input: {
  records: NonrepudiationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): NonrepudiationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const nonrepudiationizabilityPercent =
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
    nonrepudiationizabilityPercent,
  }
}

export function getNonrepudiationizabilityAdminGuidance(input: {
  stats: NonrepudiationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect nonrepudiationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial nonrepudiationizability coverage and refresh the nonrepudiationizability summary.'
  }

  if (input.stats.nonrepudiationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership nonrepudiationizability below the 95% target and refresh the nonrepudiationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace nonrepudiationizability coverage and refresh the nonrepudiationizability summary.'
}

export function resolveNonrepudiationizabilityAdminActions(): NonrepudiationizabilityAdminAction[] {
  return ['refresh_nonrepudiationizability_summary']
}
