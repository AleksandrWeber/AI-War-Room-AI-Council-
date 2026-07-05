import type {
  IntegrabilityAdminAction,
  IntegrabilityAdminRecord,
  IntegrabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIntegrabilityDomainInventory = {
  domain: IntegrabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIntegrabilityAdminRecords(
  inventory: WorkspaceIntegrabilityDomainInventory[],
): IntegrabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIntegrabilityAdminStats(input: {
  records: IntegrabilityAdminRecord[]
  postgresConnectivity: boolean
}): IntegrabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const integrabilityPercent =
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
    integrabilityPercent,
  }
}

export function getIntegrabilityAdminGuidance(input: {
  stats: IntegrabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect integrability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial integrability coverage and refresh the integrability summary.'
  }

  if (input.stats.integrabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook integrability below the 95% target and refresh the integrability summary.'
  }

  return 'Workspace owners and admins can inspect workspace integrability coverage and refresh the integrability summary.'
}

export function resolveIntegrabilityAdminActions(): IntegrabilityAdminAction[] {
  return ['refresh_integrability_summary']
}
