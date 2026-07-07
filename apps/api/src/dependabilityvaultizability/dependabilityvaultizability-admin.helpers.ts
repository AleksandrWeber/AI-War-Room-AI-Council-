import type {
  DependabilityvaultizabilityAdminAction,
  DependabilityvaultizabilityAdminRecord,
  DependabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDependabilityvaultizabilityDomainInventory = {
  domain: DependabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDependabilityvaultizabilityAdminRecords(
  inventory: WorkspaceDependabilityvaultizabilityDomainInventory[],
): DependabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDependabilityvaultizabilityAdminStats(input: {
  records: DependabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DependabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const dependabilityvaultizabilityPercent =
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
    dependabilityvaultizabilityPercent,
  }
}

export function getDependabilityvaultizabilityAdminGuidance(input: {
  stats: DependabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect dependabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial dependabilityvaultizability coverage and refresh the dependabilityvaultizability summary.'
  }

  if (input.stats.dependabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key dependabilityvaultizability below the 95% target and refresh the dependabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace dependabilityvaultizability coverage and refresh the dependabilityvaultizability summary.'
}

export function resolveDependabilityvaultizabilityAdminActions(): DependabilityvaultizabilityAdminAction[] {
  return ['refresh_dependabilityvaultizability_summary']
}
