import type {
  RobustizabilityAdminAction,
  RobustizabilityAdminRecord,
  RobustizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRobustizabilityDomainInventory = {
  domain: RobustizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRobustizabilityAdminRecords(
  inventory: WorkspaceRobustizabilityDomainInventory[],
): RobustizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRobustizabilityAdminStats(input: {
  records: RobustizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RobustizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const robustizabilityPercent =
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
    robustizabilityPercent,
  }
}

export function getRobustizabilityAdminGuidance(input: {
  stats: RobustizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect robustizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial robustizability coverage and refresh the robustizability summary.'
  }

  if (input.stats.robustizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice robustizability below the 95% target and refresh the robustizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace robustizability coverage and refresh the robustizability summary.'
}

export function resolveRobustizabilityAdminActions(): RobustizabilityAdminAction[] {
  return ['refresh_robustizability_summary']
}
