import type {
  LexicalizabilityAdminAction,
  LexicalizabilityAdminRecord,
  LexicalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceLexicalizabilityDomainInventory = {
  domain: LexicalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildLexicalizabilityAdminRecords(
  inventory: WorkspaceLexicalizabilityDomainInventory[],
): LexicalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildLexicalizabilityAdminStats(input: {
  records: LexicalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): LexicalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const lexicalizabilityPercent =
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
    lexicalizabilityPercent,
  }
}

export function getLexicalizabilityAdminGuidance(input: {
  stats: LexicalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect lexicalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial lexicalizability coverage and refresh the lexicalizability summary.'
  }

  if (input.stats.lexicalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership lexicalizability below the 95% target and refresh the lexicalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace lexicalizability coverage and refresh the lexicalizability summary.'
}

export function resolveLexicalizabilityAdminActions(): LexicalizabilityAdminAction[] {
  return ['refresh_lexicalizability_summary']
}
