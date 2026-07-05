import type {
  ScriptabilizabilityAdminAction,
  ScriptabilizabilityAdminRecord,
  ScriptabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceScriptabilizabilityDomainInventory = {
  domain: ScriptabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildScriptabilizabilityAdminRecords(
  inventory: WorkspaceScriptabilizabilityDomainInventory[],
): ScriptabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildScriptabilizabilityAdminStats(input: {
  records: ScriptabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ScriptabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const scriptabilizabilityPercent =
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
    scriptabilizabilityPercent,
  }
}

export function getScriptabilizabilityAdminGuidance(input: {
  stats: ScriptabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect scriptabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial scriptabilizability coverage and refresh the scriptabilizability summary.'
  }

  if (input.stats.scriptabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan scriptabilizability below the 95% target and refresh the scriptabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace scriptabilizability coverage and refresh the scriptabilizability summary.'
}

export function resolveScriptabilizabilityAdminActions(): ScriptabilizabilityAdminAction[] {
  return ['refresh_scriptabilizability_summary']
}
