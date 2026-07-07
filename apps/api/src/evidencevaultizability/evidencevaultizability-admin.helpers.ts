import type {
  EvidencevaultizabilityAdminAction,
  EvidencevaultizabilityAdminRecord,
  EvidencevaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceEvidencevaultizabilityDomainInventory = {
  domain: EvidencevaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildEvidencevaultizabilityAdminRecords(
  inventory: WorkspaceEvidencevaultizabilityDomainInventory[],
): EvidencevaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildEvidencevaultizabilityAdminStats(input: {
  records: EvidencevaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): EvidencevaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const evidencevaultizabilityPercent =
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
    evidencevaultizabilityPercent,
  }
}

export function getEvidencevaultizabilityAdminGuidance(input: {
  stats: EvidencevaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect evidencevaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial evidencevaultizability coverage and refresh the evidencevaultizability summary.'
  }

  if (input.stats.evidencevaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key evidencevaultizability below the 95% target and refresh the evidencevaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace evidencevaultizability coverage and refresh the evidencevaultizability summary.'
}

export function resolveEvidencevaultizabilityAdminActions(): EvidencevaultizabilityAdminAction[] {
  return ['refresh_evidencevaultizability_summary']
}
