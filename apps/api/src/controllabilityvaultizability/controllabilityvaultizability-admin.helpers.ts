import type {
  ControllabilityvaultizabilityAdminAction,
  ControllabilityvaultizabilityAdminRecord,
  ControllabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceControllabilityvaultizabilityDomainInventory = {
  domain: ControllabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildControllabilityvaultizabilityAdminRecords(
  inventory: WorkspaceControllabilityvaultizabilityDomainInventory[],
): ControllabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildControllabilityvaultizabilityAdminStats(input: {
  records: ControllabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ControllabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const controllabilityvaultizabilityPercent =
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
    controllabilityvaultizabilityPercent,
  }
}

export function getControllabilityvaultizabilityAdminGuidance(input: {
  stats: ControllabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect controllabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial controllabilityvaultizability coverage and refresh the controllabilityvaultizability summary.'
  }

  if (input.stats.controllabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan controllabilityvaultizability below the 95% target and refresh the controllabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace controllabilityvaultizability coverage and refresh the controllabilityvaultizability summary.'
}

export function resolveControllabilityvaultizabilityAdminActions(): ControllabilityvaultizabilityAdminAction[] {
  return ['refresh_controllabilityvaultizability_summary']
}
