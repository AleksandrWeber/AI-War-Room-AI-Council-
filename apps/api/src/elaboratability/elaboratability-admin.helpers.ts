import type {
  ElaboratabilityAdminAction,
  ElaboratabilityAdminRecord,
  ElaboratabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceElaboratabilityDomainInventory = {
  domain: ElaboratabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildElaboratabilityAdminRecords(
  inventory: WorkspaceElaboratabilityDomainInventory[],
): ElaboratabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildElaboratabilityAdminStats(input: {
  records: ElaboratabilityAdminRecord[]
  postgresConnectivity: boolean
}): ElaboratabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const elaboratabilityPercent =
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
    elaboratabilityPercent,
  }
}

export function getElaboratabilityAdminGuidance(input: {
  stats: ElaboratabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect elaboratability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial elaboratability coverage and refresh the elaboratability summary.'
  }

  if (input.stats.elaboratabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workflow elaboratability below the 95% target and refresh the elaboratability summary.'
  }

  return 'Workspace owners and admins can inspect workspace elaboratability coverage and refresh the elaboratability summary.'
}

export function resolveElaboratabilityAdminActions(): ElaboratabilityAdminAction[] {
  return ['refresh_elaboratability_summary']
}
