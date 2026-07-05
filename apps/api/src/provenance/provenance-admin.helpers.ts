import type {
  ProvenanceAdminAction,
  ProvenanceAdminRecord,
  ProvenanceAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceProvenanceDomainInventory = {
  domain: ProvenanceAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildProvenanceAdminRecords(
  inventory: WorkspaceProvenanceDomainInventory[],
): ProvenanceAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildProvenanceAdminStats(input: {
  records: ProvenanceAdminRecord[]
  postgresConnectivity: boolean
}): ProvenanceAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'usage_events')
      ?.recordCount ?? 0
  const provenancePercent =
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
    provenancePercent,
  }
}

export function getProvenanceAdminGuidance(input: {
  stats: ProvenanceAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect provenance metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial provenance coverage and refresh the provenance summary.'
  }

  if (input.stats.provenancePercent < 95) {
    return 'Workspace owners and admins can inspect usage provenance below the 95% target and refresh the provenance summary.'
  }

  return 'Workspace owners and admins can inspect workspace provenance coverage and refresh the provenance summary.'
}

export function resolveProvenanceAdminActions(): ProvenanceAdminAction[] {
  return ['refresh_provenance_summary']
}
