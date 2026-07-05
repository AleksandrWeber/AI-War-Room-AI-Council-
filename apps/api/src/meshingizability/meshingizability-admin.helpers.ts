import type {
  MeshingizabilityAdminAction,
  MeshingizabilityAdminRecord,
  MeshingizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMeshingizabilityDomainInventory = {
  domain: MeshingizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMeshingizabilityAdminRecords(
  inventory: WorkspaceMeshingizabilityDomainInventory[],
): MeshingizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMeshingizabilityAdminStats(input: {
  records: MeshingizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MeshingizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const meshingizabilityPercent =
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
    meshingizabilityPercent,
  }
}

export function getMeshingizabilityAdminGuidance(input: {
  stats: MeshingizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect meshingizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial meshingizability coverage and refresh the meshingizability summary.'
  }

  if (input.stats.meshingizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification meshingizability below the 95% target and refresh the meshingizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace meshingizability coverage and refresh the meshingizability summary.'
}

export function resolveMeshingizabilityAdminActions(): MeshingizabilityAdminAction[] {
  return ['refresh_meshingizability_summary']
}
