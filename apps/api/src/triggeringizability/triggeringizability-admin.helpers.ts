import type {
  TriggeringizabilityAdminAction,
  TriggeringizabilityAdminRecord,
  TriggeringizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTriggeringizabilityDomainInventory = {
  domain: TriggeringizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTriggeringizabilityAdminRecords(
  inventory: WorkspaceTriggeringizabilityDomainInventory[],
): TriggeringizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTriggeringizabilityAdminStats(input: {
  records: TriggeringizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TriggeringizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const triggeringizabilityPercent =
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
    triggeringizabilityPercent,
  }
}

export function getTriggeringizabilityAdminGuidance(input: {
  stats: TriggeringizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect triggeringizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial triggeringizability coverage and refresh the triggeringizability summary.'
  }

  if (input.stats.triggeringizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit triggeringizability below the 95% target and refresh the triggeringizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace triggeringizability coverage and refresh the triggeringizability summary.'
}

export function resolveTriggeringizabilityAdminActions(): TriggeringizabilityAdminAction[] {
  return ['refresh_triggeringizability_summary']
}
