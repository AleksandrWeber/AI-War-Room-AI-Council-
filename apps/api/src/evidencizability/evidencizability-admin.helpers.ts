import type {
  EvidencizabilityAdminAction,
  EvidencizabilityAdminRecord,
  EvidencizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceEvidencizabilityDomainInventory = {
  domain: EvidencizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildEvidencizabilityAdminRecords(
  inventory: WorkspaceEvidencizabilityDomainInventory[],
): EvidencizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildEvidencizabilityAdminStats(input: {
  records: EvidencizabilityAdminRecord[]
  postgresConnectivity: boolean
}): EvidencizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const evidencizabilityPercent =
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
    evidencizabilityPercent,
  }
}

export function getEvidencizabilityAdminGuidance(input: {
  stats: EvidencizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect evidencizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial evidencizability coverage and refresh the evidencizability summary.'
  }

  if (input.stats.evidencizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key evidencizability below the 95% target and refresh the evidencizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace evidencizability coverage and refresh the evidencizability summary.'
}

export function resolveEvidencizabilityAdminActions(): EvidencizabilityAdminAction[] {
  return ['refresh_evidencizability_summary']
}
