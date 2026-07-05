import type {
  TriggerizabilityAdminAction,
  TriggerizabilityAdminRecord,
  TriggerizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTriggerizabilityDomainInventory = {
  domain: TriggerizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTriggerizabilityAdminRecords(
  inventory: WorkspaceTriggerizabilityDomainInventory[],
): TriggerizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTriggerizabilityAdminStats(input: {
  records: TriggerizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TriggerizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const triggerizabilityPercent =
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
    triggerizabilityPercent,
  }
}

export function getTriggerizabilityAdminGuidance(input: {
  stats: TriggerizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect triggerizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial triggerizability coverage and refresh the triggerizability summary.'
  }

  if (input.stats.triggerizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification triggerizability below the 95% target and refresh the triggerizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace triggerizability coverage and refresh the triggerizability summary.'
}

export function resolveTriggerizabilityAdminActions(): TriggerizabilityAdminAction[] {
  return ['refresh_triggerizability_summary']
}
