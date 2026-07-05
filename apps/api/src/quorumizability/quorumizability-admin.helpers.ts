import type {
  QuorumizabilityAdminAction,
  QuorumizabilityAdminRecord,
  QuorumizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceQuorumizabilityDomainInventory = {
  domain: QuorumizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildQuorumizabilityAdminRecords(
  inventory: WorkspaceQuorumizabilityDomainInventory[],
): QuorumizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildQuorumizabilityAdminStats(input: {
  records: QuorumizabilityAdminRecord[]
  postgresConnectivity: boolean
}): QuorumizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const quorumizabilityPercent =
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
    quorumizabilityPercent,
  }
}

export function getQuorumizabilityAdminGuidance(input: {
  stats: QuorumizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect quorumizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial quorumizability coverage and refresh the quorumizability summary.'
  }

  if (input.stats.quorumizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan quorumizability below the 95% target and refresh the quorumizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace quorumizability coverage and refresh the quorumizability summary.'
}

export function resolveQuorumizabilityAdminActions(): QuorumizabilityAdminAction[] {
  return ['refresh_quorumizability_summary']
}
