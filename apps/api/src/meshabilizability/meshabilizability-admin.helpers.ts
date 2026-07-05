import type {
  MeshabilizabilityAdminAction,
  MeshabilizabilityAdminRecord,
  MeshabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMeshabilizabilityDomainInventory = {
  domain: MeshabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMeshabilizabilityAdminRecords(
  inventory: WorkspaceMeshabilizabilityDomainInventory[],
): MeshabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMeshabilizabilityAdminStats(input: {
  records: MeshabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MeshabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const meshabilizabilityPercent =
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
    meshabilizabilityPercent,
  }
}

export function getMeshabilizabilityAdminGuidance(input: {
  stats: MeshabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect meshabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial meshabilizability coverage and refresh the meshabilizability summary.'
  }

  if (input.stats.meshabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health meshabilizability below the 95% target and refresh the meshabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace meshabilizability coverage and refresh the meshabilizability summary.'
}

export function resolveMeshabilizabilityAdminActions(): MeshabilizabilityAdminAction[] {
  return ['refresh_meshabilizability_summary']
}
