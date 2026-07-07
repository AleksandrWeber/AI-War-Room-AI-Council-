import type {
  ForensicizabilityAdminAction,
  ForensicizabilityAdminRecord,
  ForensicizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceForensicizabilityDomainInventory = {
  domain: ForensicizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildForensicizabilityAdminRecords(
  inventory: WorkspaceForensicizabilityDomainInventory[],
): ForensicizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildForensicizabilityAdminStats(input: {
  records: ForensicizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ForensicizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const forensicizabilityPercent =
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
    forensicizabilityPercent,
  }
}

export function getForensicizabilityAdminGuidance(input: {
  stats: ForensicizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect forensicizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial forensicizability coverage and refresh the forensicizability summary.'
  }

  if (input.stats.forensicizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key forensicizability below the 95% target and refresh the forensicizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace forensicizability coverage and refresh the forensicizability summary.'
}

export function resolveForensicizabilityAdminActions(): ForensicizabilityAdminAction[] {
  return ['refresh_forensicizability_summary']
}
