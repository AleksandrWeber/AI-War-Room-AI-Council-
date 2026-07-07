import type {
  ProvisioningizabilityAdminAction,
  ProvisioningizabilityAdminRecord,
  ProvisioningizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceProvisioningizabilityDomainInventory = {
  domain: ProvisioningizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildProvisioningizabilityAdminRecords(
  inventory: WorkspaceProvisioningizabilityDomainInventory[],
): ProvisioningizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildProvisioningizabilityAdminStats(input: {
  records: ProvisioningizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ProvisioningizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const provisioningizabilityPercent =
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
    provisioningizabilityPercent,
  }
}

export function getProvisioningizabilityAdminGuidance(input: {
  stats: ProvisioningizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect provisioningizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial provisioningizability coverage and refresh the provisioningizability summary.'
  }

  if (input.stats.provisioningizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit provisioningizability below the 95% target and refresh the provisioningizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace provisioningizability coverage and refresh the provisioningizability summary.'
}

export function resolveProvisioningizabilityAdminActions(): ProvisioningizabilityAdminAction[] {
  return ['refresh_provisioningizability_summary']
}
