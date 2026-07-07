import type {
  DeployabilityvaultizabilityAdminAction,
  DeployabilityvaultizabilityAdminRecord,
  DeployabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDeployabilityvaultizabilityDomainInventory = {
  domain: DeployabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDeployabilityvaultizabilityAdminRecords(
  inventory: WorkspaceDeployabilityvaultizabilityDomainInventory[],
): DeployabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDeployabilityvaultizabilityAdminStats(input: {
  records: DeployabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DeployabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const deployabilityvaultizabilityPercent =
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
    deployabilityvaultizabilityPercent,
  }
}

export function getDeployabilityvaultizabilityAdminGuidance(input: {
  stats: DeployabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect deployabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial deployabilityvaultizability coverage and refresh the deployabilityvaultizability summary.'
  }

  if (input.stats.deployabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership deployabilityvaultizability below the 95% target and refresh the deployabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace deployabilityvaultizability coverage and refresh the deployabilityvaultizability summary.'
}

export function resolveDeployabilityvaultizabilityAdminActions(): DeployabilityvaultizabilityAdminAction[] {
  return ['refresh_deployabilityvaultizability_summary']
}
