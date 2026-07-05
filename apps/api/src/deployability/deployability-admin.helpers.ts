import type {
  DeployabilityAdminAction,
  DeployabilityAdminRecord,
  DeployabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDeployabilityDomainInventory = {
  domain: DeployabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDeployabilityAdminRecords(
  inventory: WorkspaceDeployabilityDomainInventory[],
): DeployabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDeployabilityAdminStats(input: {
  records: DeployabilityAdminRecord[]
  postgresConnectivity: boolean
}): DeployabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const deployabilityPercent =
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
    deployabilityPercent,
  }
}

export function getDeployabilityAdminGuidance(input: {
  stats: DeployabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect deployability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial deployability coverage and refresh the deployability summary.'
  }

  if (input.stats.deployabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential deployability below the 95% target and refresh the deployability summary.'
  }

  return 'Workspace owners and admins can inspect workspace deployability coverage and refresh the deployability summary.'
}

export function resolveDeployabilityAdminActions(): DeployabilityAdminAction[] {
  return ['refresh_deployability_summary']
}
