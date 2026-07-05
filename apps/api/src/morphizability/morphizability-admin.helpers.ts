import type {
  MorphizabilityAdminAction,
  MorphizabilityAdminRecord,
  MorphizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMorphizabilityDomainInventory = {
  domain: MorphizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMorphizabilityAdminRecords(
  inventory: WorkspaceMorphizabilityDomainInventory[],
): MorphizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMorphizabilityAdminStats(input: {
  records: MorphizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MorphizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const morphizabilityPercent =
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
    morphizabilityPercent,
  }
}

export function getMorphizabilityAdminGuidance(input: {
  stats: MorphizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect morphizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial morphizability coverage and refresh the morphizability summary.'
  }

  if (input.stats.morphizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit morphizability below the 95% target and refresh the morphizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace morphizability coverage and refresh the morphizability summary.'
}

export function resolveMorphizabilityAdminActions(): MorphizabilityAdminAction[] {
  return ['refresh_morphizability_summary']
}
