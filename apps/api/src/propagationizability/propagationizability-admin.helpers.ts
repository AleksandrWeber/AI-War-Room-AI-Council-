import type {
  PropagationizabilityAdminAction,
  PropagationizabilityAdminRecord,
  PropagationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePropagationizabilityDomainInventory = {
  domain: PropagationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPropagationizabilityAdminRecords(
  inventory: WorkspacePropagationizabilityDomainInventory[],
): PropagationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPropagationizabilityAdminStats(input: {
  records: PropagationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PropagationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const propagationizabilityPercent =
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
    propagationizabilityPercent,
  }
}

export function getPropagationizabilityAdminGuidance(input: {
  stats: PropagationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect propagationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial propagationizability coverage and refresh the propagationizability summary.'
  }

  if (input.stats.propagationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential propagationizability below the 95% target and refresh the propagationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace propagationizability coverage and refresh the propagationizability summary.'
}

export function resolvePropagationizabilityAdminActions(): PropagationizabilityAdminAction[] {
  return ['refresh_propagationizability_summary']
}
