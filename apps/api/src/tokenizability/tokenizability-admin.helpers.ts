import type {
  TokenizabilityAdminAction,
  TokenizabilityAdminRecord,
  TokenizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTokenizabilityDomainInventory = {
  domain: TokenizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTokenizabilityAdminRecords(
  inventory: WorkspaceTokenizabilityDomainInventory[],
): TokenizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTokenizabilityAdminStats(input: {
  records: TokenizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TokenizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const tokenizabilityPercent =
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
    tokenizabilityPercent,
  }
}

export function getTokenizabilityAdminGuidance(input: {
  stats: TokenizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect tokenizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial tokenizability coverage and refresh the tokenizability summary.'
  }

  if (input.stats.tokenizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership tokenizability below the 95% target and refresh the tokenizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace tokenizability coverage and refresh the tokenizability summary.'
}

export function resolveTokenizabilityAdminActions(): TokenizabilityAdminAction[] {
  return ['refresh_tokenizability_summary']
}
