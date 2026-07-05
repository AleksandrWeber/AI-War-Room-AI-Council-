import type {
  ConsensusizabilityAdminAction,
  ConsensusizabilityAdminRecord,
  ConsensusizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConsensusizabilityDomainInventory = {
  domain: ConsensusizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConsensusizabilityAdminRecords(
  inventory: WorkspaceConsensusizabilityDomainInventory[],
): ConsensusizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConsensusizabilityAdminStats(input: {
  records: ConsensusizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ConsensusizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const consensusizabilityPercent =
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
    consensusizabilityPercent,
  }
}

export function getConsensusizabilityAdminGuidance(input: {
  stats: ConsensusizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect consensusizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial consensusizability coverage and refresh the consensusizability summary.'
  }

  if (input.stats.consensusizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health consensusizability below the 95% target and refresh the consensusizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace consensusizability coverage and refresh the consensusizability summary.'
}

export function resolveConsensusizabilityAdminActions(): ConsensusizabilityAdminAction[] {
  return ['refresh_consensusizability_summary']
}
