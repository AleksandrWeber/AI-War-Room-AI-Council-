import type {
  EffectivenessAdminAction,
  EffectivenessAdminRecord,
  EffectivenessAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceEffectivenessDomainInventory = {
  domain: EffectivenessAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildEffectivenessAdminRecords(
  inventory: WorkspaceEffectivenessDomainInventory[],
): EffectivenessAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildEffectivenessAdminStats(input: {
  records: EffectivenessAdminRecord[]
  postgresConnectivity: boolean
}): EffectivenessAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'agent_outputs')
      ?.recordCount ?? 0
  const effectivenessPercent =
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
    effectivenessPercent,
  }
}

export function getEffectivenessAdminGuidance(input: {
  stats: EffectivenessAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect effectiveness metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial effectiveness coverage and refresh the effectiveness summary.'
  }

  if (input.stats.effectivenessPercent < 95) {
    return 'Workspace owners and admins can inspect agent output effectiveness below the 95% target and refresh the effectiveness summary.'
  }

  return 'Workspace owners and admins can inspect workspace effectiveness coverage and refresh the effectiveness summary.'
}

export function resolveEffectivenessAdminActions(): EffectivenessAdminAction[] {
  return ['refresh_effectiveness_summary']
}
