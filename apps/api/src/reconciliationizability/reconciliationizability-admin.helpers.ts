import type {
  ReconciliationizabilityAdminAction,
  ReconciliationizabilityAdminRecord,
  ReconciliationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceReconciliationizabilityDomainInventory = {
  domain: ReconciliationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildReconciliationizabilityAdminRecords(
  inventory: WorkspaceReconciliationizabilityDomainInventory[],
): ReconciliationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildReconciliationizabilityAdminStats(input: {
  records: ReconciliationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ReconciliationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const reconciliationizabilityPercent =
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
    reconciliationizabilityPercent,
  }
}

export function getReconciliationizabilityAdminGuidance(input: {
  stats: ReconciliationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect reconciliationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial reconciliationizability coverage and refresh the reconciliationizability summary.'
  }

  if (input.stats.reconciliationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan reconciliationizability below the 95% target and refresh the reconciliationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace reconciliationizability coverage and refresh the reconciliationizability summary.'
}

export function resolveReconciliationizabilityAdminActions(): ReconciliationizabilityAdminAction[] {
  return ['refresh_reconciliationizability_summary']
}
