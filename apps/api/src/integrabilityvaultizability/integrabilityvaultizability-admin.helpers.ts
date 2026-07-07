import type {
  IntegrabilityvaultizabilityAdminAction,
  IntegrabilityvaultizabilityAdminRecord,
  IntegrabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIntegrabilityvaultizabilityDomainInventory = {
  domain: IntegrabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIntegrabilityvaultizabilityAdminRecords(
  inventory: WorkspaceIntegrabilityvaultizabilityDomainInventory[],
): IntegrabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIntegrabilityvaultizabilityAdminStats(input: {
  records: IntegrabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): IntegrabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const integrabilityvaultizabilityPercent =
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
    integrabilityvaultizabilityPercent,
  }
}

export function getIntegrabilityvaultizabilityAdminGuidance(input: {
  stats: IntegrabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect integrabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial integrabilityvaultizability coverage and refresh the integrabilityvaultizability summary.'
  }

  if (input.stats.integrabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification integrabilityvaultizability below the 95% target and refresh the integrabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace integrabilityvaultizability coverage and refresh the integrabilityvaultizability summary.'
}

export function resolveIntegrabilityvaultizabilityAdminActions(): IntegrabilityvaultizabilityAdminAction[] {
  return ['refresh_integrabilityvaultizability_summary']
}
