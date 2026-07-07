import type {
  IntegrityjournalizabilityAdminAction,
  IntegrityjournalizabilityAdminRecord,
  IntegrityjournalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIntegrityjournalizabilityDomainInventory = {
  domain: IntegrityjournalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIntegrityjournalizabilityAdminRecords(
  inventory: WorkspaceIntegrityjournalizabilityDomainInventory[],
): IntegrityjournalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIntegrityjournalizabilityAdminStats(input: {
  records: IntegrityjournalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): IntegrityjournalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const integrityjournalizabilityPercent =
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
    integrityjournalizabilityPercent,
  }
}

export function getIntegrityjournalizabilityAdminGuidance(input: {
  stats: IntegrityjournalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect integrityjournalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial integrityjournalizability coverage and refresh the integrityjournalizability summary.'
  }

  if (input.stats.integrityjournalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification integrityjournalizability below the 95% target and refresh the integrityjournalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace integrityjournalizability coverage and refresh the integrityjournalizability summary.'
}

export function resolveIntegrityjournalizabilityAdminActions(): IntegrityjournalizabilityAdminAction[] {
  return ['refresh_integrityjournalizability_summary']
}
