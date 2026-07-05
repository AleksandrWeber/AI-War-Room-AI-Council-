import type {
  IterativizabilityAdminAction,
  IterativizabilityAdminRecord,
  IterativizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIterativizabilityDomainInventory = {
  domain: IterativizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIterativizabilityAdminRecords(
  inventory: WorkspaceIterativizabilityDomainInventory[],
): IterativizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIterativizabilityAdminStats(input: {
  records: IterativizabilityAdminRecord[]
  postgresConnectivity: boolean
}): IterativizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const iterativizabilityPercent =
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
    iterativizabilityPercent,
  }
}

export function getIterativizabilityAdminGuidance(input: {
  stats: IterativizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect iterativizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial iterativizability coverage and refresh the iterativizability summary.'
  }

  if (input.stats.iterativizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage iterativizability below the 95% target and refresh the iterativizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace iterativizability coverage and refresh the iterativizability summary.'
}

export function resolveIterativizabilityAdminActions(): IterativizabilityAdminAction[] {
  return ['refresh_iterativizability_summary']
}
