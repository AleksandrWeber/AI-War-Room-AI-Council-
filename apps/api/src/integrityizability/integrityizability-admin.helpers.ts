import type {
  IntegrityizabilityAdminAction,
  IntegrityizabilityAdminRecord,
  IntegrityizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIntegrityizabilityDomainInventory = {
  domain: IntegrityizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIntegrityizabilityAdminRecords(
  inventory: WorkspaceIntegrityizabilityDomainInventory[],
): IntegrityizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIntegrityizabilityAdminStats(input: {
  records: IntegrityizabilityAdminRecord[]
  postgresConnectivity: boolean
}): IntegrityizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const integrityizabilityPercent =
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
    integrityizabilityPercent,
  }
}

export function getIntegrityizabilityAdminGuidance(input: {
  stats: IntegrityizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect integrityizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial integrityizability coverage and refresh the integrityizability summary.'
  }

  if (input.stats.integrityizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification integrityizability below the 95% target and refresh the integrityizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace integrityizability coverage and refresh the integrityizability summary.'
}

export function resolveIntegrityizabilityAdminActions(): IntegrityizabilityAdminAction[] {
  return ['refresh_integrityizability_summary']
}
