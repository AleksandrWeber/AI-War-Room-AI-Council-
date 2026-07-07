import type {
  ProvenancevaultizabilityAdminAction,
  ProvenancevaultizabilityAdminRecord,
  ProvenancevaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceProvenancevaultizabilityDomainInventory = {
  domain: ProvenancevaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildProvenancevaultizabilityAdminRecords(
  inventory: WorkspaceProvenancevaultizabilityDomainInventory[],
): ProvenancevaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildProvenancevaultizabilityAdminStats(input: {
  records: ProvenancevaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ProvenancevaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const provenancevaultizabilityPercent =
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
    provenancevaultizabilityPercent,
  }
}

export function getProvenancevaultizabilityAdminGuidance(input: {
  stats: ProvenancevaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect provenancevaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial provenancevaultizability coverage and refresh the provenancevaultizability summary.'
  }

  if (input.stats.provenancevaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key provenancevaultizability below the 95% target and refresh the provenancevaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace provenancevaultizability coverage and refresh the provenancevaultizability summary.'
}

export function resolveProvenancevaultizabilityAdminActions(): ProvenancevaultizabilityAdminAction[] {
  return ['refresh_provenancevaultizability_summary']
}
