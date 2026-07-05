import type {
  CaracterizabilityAdminAction,
  CaracterizabilityAdminRecord,
  CaracterizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCaracterizabilityDomainInventory = {
  domain: CaracterizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCaracterizabilityAdminRecords(
  inventory: WorkspaceCaracterizabilityDomainInventory[],
): CaracterizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCaracterizabilityAdminStats(input: {
  records: CaracterizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CaracterizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const caracterizabilityPercent =
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
    caracterizabilityPercent,
  }
}

export function getCaracterizabilityAdminGuidance(input: {
  stats: CaracterizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect caracterizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial caracterizability coverage and refresh the caracterizability summary.'
  }

  if (input.stats.caracterizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workflow caracterizability below the 95% target and refresh the caracterizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace caracterizability coverage and refresh the caracterizability summary.'
}

export function resolveCaracterizabilityAdminActions(): CaracterizabilityAdminAction[] {
  return ['refresh_caracterizability_summary']
}
