import type {
  SequencizabilityAdminAction,
  SequencizabilityAdminRecord,
  SequencizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSequencizabilityDomainInventory = {
  domain: SequencizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSequencizabilityAdminRecords(
  inventory: WorkspaceSequencizabilityDomainInventory[],
): SequencizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSequencizabilityAdminStats(input: {
  records: SequencizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SequencizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const sequencizabilityPercent =
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
    sequencizabilityPercent,
  }
}

export function getSequencizabilityAdminGuidance(input: {
  stats: SequencizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect sequencizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial sequencizability coverage and refresh the sequencizability summary.'
  }

  if (input.stats.sequencizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health sequencizability below the 95% target and refresh the sequencizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace sequencizability coverage and refresh the sequencizability summary.'
}

export function resolveSequencizabilityAdminActions(): SequencizabilityAdminAction[] {
  return ['refresh_sequencizability_summary']
}
