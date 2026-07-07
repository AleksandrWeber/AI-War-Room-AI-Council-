import type {
  ManageabilityvaultizabilityAdminAction,
  ManageabilityvaultizabilityAdminRecord,
  ManageabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceManageabilityvaultizabilityDomainInventory = {
  domain: ManageabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildManageabilityvaultizabilityAdminRecords(
  inventory: WorkspaceManageabilityvaultizabilityDomainInventory[],
): ManageabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildManageabilityvaultizabilityAdminStats(input: {
  records: ManageabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ManageabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const manageabilityvaultizabilityPercent =
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
    manageabilityvaultizabilityPercent,
  }
}

export function getManageabilityvaultizabilityAdminGuidance(input: {
  stats: ManageabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect manageabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial manageabilityvaultizability coverage and refresh the manageabilityvaultizability summary.'
  }

  if (input.stats.manageabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key manageabilityvaultizability below the 95% target and refresh the manageabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace manageabilityvaultizability coverage and refresh the manageabilityvaultizability summary.'
}

export function resolveManageabilityvaultizabilityAdminActions(): ManageabilityvaultizabilityAdminAction[] {
  return ['refresh_manageabilityvaultizability_summary']
}
