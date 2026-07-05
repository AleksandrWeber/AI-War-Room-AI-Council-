import type {
  MaterializabilityAdminAction,
  MaterializabilityAdminRecord,
  MaterializabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMaterializabilityDomainInventory = {
  domain: MaterializabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMaterializabilityAdminRecords(
  inventory: WorkspaceMaterializabilityDomainInventory[],
): MaterializabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMaterializabilityAdminStats(input: {
  records: MaterializabilityAdminRecord[]
  postgresConnectivity: boolean
}): MaterializabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const materializabilityPercent =
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
    materializabilityPercent,
  }
}

export function getMaterializabilityAdminGuidance(input: {
  stats: MaterializabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect materializability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial materializability coverage and refresh the materializability summary.'
  }

  if (input.stats.materializabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workflow materializability below the 95% target and refresh the materializability summary.'
  }

  return 'Workspace owners and admins can inspect workspace materializability coverage and refresh the materializability summary.'
}

export function resolveMaterializabilityAdminActions(): MaterializabilityAdminAction[] {
  return ['refresh_materializability_summary']
}
