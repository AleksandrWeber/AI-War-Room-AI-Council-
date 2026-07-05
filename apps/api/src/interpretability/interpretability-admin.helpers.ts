import type {
  InterpretabilityAdminAction,
  InterpretabilityAdminRecord,
  InterpretabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceInterpretabilityDomainInventory = {
  domain: InterpretabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildInterpretabilityAdminRecords(
  inventory: WorkspaceInterpretabilityDomainInventory[],
): InterpretabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildInterpretabilityAdminStats(input: {
  records: InterpretabilityAdminRecord[]
  postgresConnectivity: boolean
}): InterpretabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'agent_outputs')
      ?.recordCount ?? 0
  const interpretabilityPercent =
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
    interpretabilityPercent,
  }
}

export function getInterpretabilityAdminGuidance(input: {
  stats: InterpretabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect interpretability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial interpretability coverage and refresh the interpretability summary.'
  }

  if (input.stats.interpretabilityPercent < 95) {
    return 'Workspace owners and admins can inspect agent output interpretability below the 95% target and refresh the interpretability summary.'
  }

  return 'Workspace owners and admins can inspect workspace interpretability coverage and refresh the interpretability summary.'
}

export function resolveInterpretabilityAdminActions(): InterpretabilityAdminAction[] {
  return ['refresh_interpretability_summary']
}
