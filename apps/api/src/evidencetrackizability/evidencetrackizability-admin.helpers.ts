import type {
  EvidencetrackizabilityAdminAction,
  EvidencetrackizabilityAdminRecord,
  EvidencetrackizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceEvidencetrackizabilityDomainInventory = {
  domain: EvidencetrackizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildEvidencetrackizabilityAdminRecords(
  inventory: WorkspaceEvidencetrackizabilityDomainInventory[],
): EvidencetrackizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildEvidencetrackizabilityAdminStats(input: {
  records: EvidencetrackizabilityAdminRecord[]
  postgresConnectivity: boolean
}): EvidencetrackizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const evidencetrackizabilityPercent =
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
    evidencetrackizabilityPercent,
  }
}

export function getEvidencetrackizabilityAdminGuidance(input: {
  stats: EvidencetrackizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect evidencetrackizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial evidencetrackizability coverage and refresh the evidencetrackizability summary.'
  }

  if (input.stats.evidencetrackizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key evidencetrackizability below the 95% target and refresh the evidencetrackizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace evidencetrackizability coverage and refresh the evidencetrackizability summary.'
}

export function resolveEvidencetrackizabilityAdminActions(): EvidencetrackizabilityAdminAction[] {
  return ['refresh_evidencetrackizability_summary']
}
