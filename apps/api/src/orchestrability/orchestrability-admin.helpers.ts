import type {
  OrchestrabilityAdminAction,
  OrchestrabilityAdminRecord,
  OrchestrabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceOrchestrabilityDomainInventory = {
  domain: OrchestrabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildOrchestrabilityAdminRecords(
  inventory: WorkspaceOrchestrabilityDomainInventory[],
): OrchestrabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildOrchestrabilityAdminStats(input: {
  records: OrchestrabilityAdminRecord[]
  postgresConnectivity: boolean
}): OrchestrabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const orchestrabilityPercent =
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
    orchestrabilityPercent,
  }
}

export function getOrchestrabilityAdminGuidance(input: {
  stats: OrchestrabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect orchestrability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial orchestrability coverage and refresh the orchestrability summary.'
  }

  if (input.stats.orchestrabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workflow orchestrability below the 95% target and refresh the orchestrability summary.'
  }

  return 'Workspace owners and admins can inspect workspace orchestrability coverage and refresh the orchestrability summary.'
}

export function resolveOrchestrabilityAdminActions(): OrchestrabilityAdminAction[] {
  return ['refresh_orchestrability_summary']
}
