import type {
  ProofregistryizabilityAdminAction,
  ProofregistryizabilityAdminRecord,
  ProofregistryizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceProofregistryizabilityDomainInventory = {
  domain: ProofregistryizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildProofregistryizabilityAdminRecords(
  inventory: WorkspaceProofregistryizabilityDomainInventory[],
): ProofregistryizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildProofregistryizabilityAdminStats(input: {
  records: ProofregistryizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ProofregistryizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const proofregistryizabilityPercent =
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
    proofregistryizabilityPercent,
  }
}

export function getProofregistryizabilityAdminGuidance(input: {
  stats: ProofregistryizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect proofregistryizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial proofregistryizability coverage and refresh the proofregistryizability summary.'
  }

  if (input.stats.proofregistryizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan proofregistryizability below the 95% target and refresh the proofregistryizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace proofregistryizability coverage and refresh the proofregistryizability summary.'
}

export function resolveProofregistryizabilityAdminActions(): ProofregistryizabilityAdminAction[] {
  return ['refresh_proofregistryizability_summary']
}
