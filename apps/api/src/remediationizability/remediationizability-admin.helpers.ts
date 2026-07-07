import type {
  RemediationizabilityAdminAction,
  RemediationizabilityAdminRecord,
  RemediationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRemediationizabilityDomainInventory = {
  domain: RemediationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRemediationizabilityAdminRecords(
  inventory: WorkspaceRemediationizabilityDomainInventory[],
): RemediationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRemediationizabilityAdminStats(input: {
  records: RemediationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RemediationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const remediationizabilityPercent =
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
    remediationizabilityPercent,
  }
}

export function getRemediationizabilityAdminGuidance(input: {
  stats: RemediationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect remediationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial remediationizability coverage and refresh the remediationizability summary.'
  }

  if (input.stats.remediationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key remediationizability below the 95% target and refresh the remediationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace remediationizability coverage and refresh the remediationizability summary.'
}

export function resolveRemediationizabilityAdminActions(): RemediationizabilityAdminAction[] {
  return ['refresh_remediationizability_summary']
}
