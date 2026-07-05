import type {
  StabilizabilityAdminAction,
  StabilizabilityAdminRecord,
  StabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceStabilizabilityDomainInventory = {
  domain: StabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildStabilizabilityAdminRecords(
  inventory: WorkspaceStabilizabilityDomainInventory[],
): StabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildStabilizabilityAdminStats(input: {
  records: StabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): StabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const stabilizabilityPercent =
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
    stabilizabilityPercent,
  }
}

export function getStabilizabilityAdminGuidance(input: {
  stats: StabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect stabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial stabilizability coverage and refresh the stabilizability summary.'
  }

  if (input.stats.stabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential stabilizability below the 95% target and refresh the stabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace stabilizability coverage and refresh the stabilizability summary.'
}

export function resolveStabilizabilityAdminActions(): StabilizabilityAdminAction[] {
  return ['refresh_stabilizability_summary']
}
