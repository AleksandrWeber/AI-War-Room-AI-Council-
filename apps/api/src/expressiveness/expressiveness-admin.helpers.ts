import type {
  ExpressivenessAdminAction,
  ExpressivenessAdminRecord,
  ExpressivenessAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceExpressivenessDomainInventory = {
  domain: ExpressivenessAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildExpressivenessAdminRecords(
  inventory: WorkspaceExpressivenessDomainInventory[],
): ExpressivenessAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildExpressivenessAdminStats(input: {
  records: ExpressivenessAdminRecord[]
  postgresConnectivity: boolean
}): ExpressivenessAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'agent_outputs')
      ?.recordCount ?? 0
  const expressivenessPercent =
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
    expressivenessPercent,
  }
}

export function getExpressivenessAdminGuidance(input: {
  stats: ExpressivenessAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect expressiveness metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial expressiveness coverage and refresh the expressiveness summary.'
  }

  if (input.stats.expressivenessPercent < 95) {
    return 'Workspace owners and admins can inspect agent output expressiveness below the 95% target and refresh the expressiveness summary.'
  }

  return 'Workspace owners and admins can inspect workspace expressiveness coverage and refresh the expressiveness summary.'
}

export function resolveExpressivenessAdminActions(): ExpressivenessAdminAction[] {
  return ['refresh_expressiveness_summary']
}
