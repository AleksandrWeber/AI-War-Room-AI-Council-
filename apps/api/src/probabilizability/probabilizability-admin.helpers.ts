import type {
  ProbabilizabilityAdminAction,
  ProbabilizabilityAdminRecord,
  ProbabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceProbabilizabilityDomainInventory = {
  domain: ProbabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildProbabilizabilityAdminRecords(
  inventory: WorkspaceProbabilizabilityDomainInventory[],
): ProbabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildProbabilizabilityAdminStats(input: {
  records: ProbabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ProbabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const probabilizabilityPercent =
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
    probabilizabilityPercent,
  }
}

export function getProbabilizabilityAdminGuidance(input: {
  stats: ProbabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect probabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial probabilizability coverage and refresh the probabilizability summary.'
  }

  if (input.stats.probabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook probabilizability below the 95% target and refresh the probabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace probabilizability coverage and refresh the probabilizability summary.'
}

export function resolveProbabilizabilityAdminActions(): ProbabilizabilityAdminAction[] {
  return ['refresh_probabilizability_summary']
}
