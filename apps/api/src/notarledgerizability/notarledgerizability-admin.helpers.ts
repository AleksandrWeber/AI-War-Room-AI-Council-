import type {
  NotarledgerizabilityAdminAction,
  NotarledgerizabilityAdminRecord,
  NotarledgerizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceNotarledgerizabilityDomainInventory = {
  domain: NotarledgerizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildNotarledgerizabilityAdminRecords(
  inventory: WorkspaceNotarledgerizabilityDomainInventory[],
): NotarledgerizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildNotarledgerizabilityAdminStats(input: {
  records: NotarledgerizabilityAdminRecord[]
  postgresConnectivity: boolean
}): NotarledgerizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const notarledgerizabilityPercent =
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
    notarledgerizabilityPercent,
  }
}

export function getNotarledgerizabilityAdminGuidance(input: {
  stats: NotarledgerizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect notarledgerizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial notarledgerizability coverage and refresh the notarledgerizability summary.'
  }

  if (input.stats.notarledgerizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership notarledgerizability below the 95% target and refresh the notarledgerizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace notarledgerizability coverage and refresh the notarledgerizability summary.'
}

export function resolveNotarledgerizabilityAdminActions(): NotarledgerizabilityAdminAction[] {
  return ['refresh_notarledgerizability_summary']
}
