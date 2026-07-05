import type {
  DeployabilizabilityAdminAction,
  DeployabilizabilityAdminRecord,
  DeployabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDeployabilizabilityDomainInventory = {
  domain: DeployabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDeployabilizabilityAdminRecords(
  inventory: WorkspaceDeployabilizabilityDomainInventory[],
): DeployabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDeployabilizabilityAdminStats(input: {
  records: DeployabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DeployabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const deployabilizabilityPercent =
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
    deployabilizabilityPercent,
  }
}

export function getDeployabilizabilityAdminGuidance(input: {
  stats: DeployabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect deployabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial deployabilizability coverage and refresh the deployabilizability summary.'
  }

  if (input.stats.deployabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health deployabilizability below the 95% target and refresh the deployabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace deployabilizability coverage and refresh the deployabilizability summary.'
}

export function resolveDeployabilizabilityAdminActions(): DeployabilizabilityAdminAction[] {
  return ['refresh_deployabilizability_summary']
}
