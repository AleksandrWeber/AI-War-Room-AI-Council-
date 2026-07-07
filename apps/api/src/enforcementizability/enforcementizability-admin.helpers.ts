import type {
  EnforcementizabilityAdminAction,
  EnforcementizabilityAdminRecord,
  EnforcementizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceEnforcementizabilityDomainInventory = {
  domain: EnforcementizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildEnforcementizabilityAdminRecords(
  inventory: WorkspaceEnforcementizabilityDomainInventory[],
): EnforcementizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildEnforcementizabilityAdminStats(input: {
  records: EnforcementizabilityAdminRecord[]
  postgresConnectivity: boolean
}): EnforcementizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const enforcementizabilityPercent =
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
    enforcementizabilityPercent,
  }
}

export function getEnforcementizabilityAdminGuidance(input: {
  stats: EnforcementizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect enforcementizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial enforcementizability coverage and refresh the enforcementizability summary.'
  }

  if (input.stats.enforcementizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key enforcementizability below the 95% target and refresh the enforcementizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace enforcementizability coverage and refresh the enforcementizability summary.'
}

export function resolveEnforcementizabilityAdminActions(): EnforcementizabilityAdminAction[] {
  return ['refresh_enforcementizability_summary']
}
