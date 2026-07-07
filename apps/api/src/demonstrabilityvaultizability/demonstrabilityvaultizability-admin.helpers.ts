import type {
  DemonstrabilityvaultizabilityAdminAction,
  DemonstrabilityvaultizabilityAdminRecord,
  DemonstrabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDemonstrabilityvaultizabilityDomainInventory = {
  domain: DemonstrabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDemonstrabilityvaultizabilityAdminRecords(
  inventory: WorkspaceDemonstrabilityvaultizabilityDomainInventory[],
): DemonstrabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDemonstrabilityvaultizabilityAdminStats(input: {
  records: DemonstrabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DemonstrabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const demonstrabilityvaultizabilityPercent =
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
    demonstrabilityvaultizabilityPercent,
  }
}

export function getDemonstrabilityvaultizabilityAdminGuidance(input: {
  stats: DemonstrabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect demonstrabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial demonstrabilityvaultizability coverage and refresh the demonstrabilityvaultizability summary.'
  }

  if (input.stats.demonstrabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key demonstrabilityvaultizability below the 95% target and refresh the demonstrabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace demonstrabilityvaultizability coverage and refresh the demonstrabilityvaultizability summary.'
}

export function resolveDemonstrabilityvaultizabilityAdminActions(): DemonstrabilityvaultizabilityAdminAction[] {
  return ['refresh_demonstrabilityvaultizability_summary']
}
