import type {
  ComparabilityvaultizabilityAdminAction,
  ComparabilityvaultizabilityAdminRecord,
  ComparabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceComparabilityvaultizabilityDomainInventory = {
  domain: ComparabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildComparabilityvaultizabilityAdminRecords(
  inventory: WorkspaceComparabilityvaultizabilityDomainInventory[],
): ComparabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildComparabilityvaultizabilityAdminStats(input: {
  records: ComparabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ComparabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const comparabilityvaultizabilityPercent =
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
    comparabilityvaultizabilityPercent,
  }
}

export function getComparabilityvaultizabilityAdminGuidance(input: {
  stats: ComparabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect comparabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial comparabilityvaultizability coverage and refresh the comparabilityvaultizability summary.'
  }

  if (input.stats.comparabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key comparabilityvaultizability below the 95% target and refresh the comparabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace comparabilityvaultizability coverage and refresh the comparabilityvaultizability summary.'
}

export function resolveComparabilityvaultizabilityAdminActions(): ComparabilityvaultizabilityAdminAction[] {
  return ['refresh_comparabilityvaultizability_summary']
}
