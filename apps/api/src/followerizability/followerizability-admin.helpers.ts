import type {
  FollowerizabilityAdminAction,
  FollowerizabilityAdminRecord,
  FollowerizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceFollowerizabilityDomainInventory = {
  domain: FollowerizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildFollowerizabilityAdminRecords(
  inventory: WorkspaceFollowerizabilityDomainInventory[],
): FollowerizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildFollowerizabilityAdminStats(input: {
  records: FollowerizabilityAdminRecord[]
  postgresConnectivity: boolean
}): FollowerizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const followerizabilityPercent =
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
    followerizabilityPercent,
  }
}

export function getFollowerizabilityAdminGuidance(input: {
  stats: FollowerizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect followerizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial followerizability coverage and refresh the followerizability summary.'
  }

  if (input.stats.followerizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential followerizability below the 95% target and refresh the followerizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace followerizability coverage and refresh the followerizability summary.'
}

export function resolveFollowerizabilityAdminActions(): FollowerizabilityAdminAction[] {
  return ['refresh_followerizability_summary']
}
