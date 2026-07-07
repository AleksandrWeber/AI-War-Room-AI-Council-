import type {
  ProoflineizabilityAdminAction,
  ProoflineizabilityAdminRecord,
  ProoflineizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceProoflineizabilityDomainInventory = {
  domain: ProoflineizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildProoflineizabilityAdminRecords(
  inventory: WorkspaceProoflineizabilityDomainInventory[],
): ProoflineizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildProoflineizabilityAdminStats(input: {
  records: ProoflineizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ProoflineizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const prooflineizabilityPercent =
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
    prooflineizabilityPercent,
  }
}

export function getProoflineizabilityAdminGuidance(input: {
  stats: ProoflineizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect prooflineizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial prooflineizability coverage and refresh the prooflineizability summary.'
  }

  if (input.stats.prooflineizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan prooflineizability below the 95% target and refresh the prooflineizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace prooflineizability coverage and refresh the prooflineizability summary.'
}

export function resolveProoflineizabilityAdminActions(): ProoflineizabilityAdminAction[] {
  return ['refresh_prooflineizability_summary']
}
