import type {
  ObservabilizabilityAdminAction,
  ObservabilizabilityAdminRecord,
  ObservabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceObservabilizabilityDomainInventory = {
  domain: ObservabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildObservabilizabilityAdminRecords(
  inventory: WorkspaceObservabilizabilityDomainInventory[],
): ObservabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildObservabilizabilityAdminStats(input: {
  records: ObservabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ObservabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const observabilizabilityPercent =
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
    observabilizabilityPercent,
  }
}

export function getObservabilizabilityAdminGuidance(input: {
  stats: ObservabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect observabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial observabilizability coverage and refresh the observabilizability summary.'
  }

  if (input.stats.observabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification observabilizability below the 95% target and refresh the observabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace observabilizability coverage and refresh the observabilizability summary.'
}

export function resolveObservabilizabilityAdminActions(): ObservabilizabilityAdminAction[] {
  return ['refresh_observabilizability_summary']
}
