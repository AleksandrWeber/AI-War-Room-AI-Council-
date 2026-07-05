import type {
  ThesaurusizabilityAdminAction,
  ThesaurusizabilityAdminRecord,
  ThesaurusizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceThesaurusizabilityDomainInventory = {
  domain: ThesaurusizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildThesaurusizabilityAdminRecords(
  inventory: WorkspaceThesaurusizabilityDomainInventory[],
): ThesaurusizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildThesaurusizabilityAdminStats(input: {
  records: ThesaurusizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ThesaurusizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const thesaurusizabilityPercent =
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
    thesaurusizabilityPercent,
  }
}

export function getThesaurusizabilityAdminGuidance(input: {
  stats: ThesaurusizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect thesaurusizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial thesaurusizability coverage and refresh the thesaurusizability summary.'
  }

  if (input.stats.thesaurusizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key thesaurusizability below the 95% target and refresh the thesaurusizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace thesaurusizability coverage and refresh the thesaurusizability summary.'
}

export function resolveThesaurusizabilityAdminActions(): ThesaurusizabilityAdminAction[] {
  return ['refresh_thesaurusizability_summary']
}
