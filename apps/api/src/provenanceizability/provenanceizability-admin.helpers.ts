import type {
  ProvenanceizabilityAdminAction,
  ProvenanceizabilityAdminRecord,
  ProvenanceizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceProvenanceizabilityDomainInventory = {
  domain: ProvenanceizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildProvenanceizabilityAdminRecords(
  inventory: WorkspaceProvenanceizabilityDomainInventory[],
): ProvenanceizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildProvenanceizabilityAdminStats(input: {
  records: ProvenanceizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ProvenanceizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const provenanceizabilityPercent =
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
    provenanceizabilityPercent,
  }
}

export function getProvenanceizabilityAdminGuidance(input: {
  stats: ProvenanceizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect provenanceizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial provenanceizability coverage and refresh the provenanceizability summary.'
  }

  if (input.stats.provenanceizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice provenanceizability below the 95% target and refresh the provenanceizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace provenanceizability coverage and refresh the provenanceizability summary.'
}

export function resolveProvenanceizabilityAdminActions(): ProvenanceizabilityAdminAction[] {
  return ['refresh_provenanceizability_summary']
}
