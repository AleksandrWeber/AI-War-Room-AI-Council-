import type {
  NotarizationizabilityAdminAction,
  NotarizationizabilityAdminRecord,
  NotarizationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceNotarizationizabilityDomainInventory = {
  domain: NotarizationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildNotarizationizabilityAdminRecords(
  inventory: WorkspaceNotarizationizabilityDomainInventory[],
): NotarizationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildNotarizationizabilityAdminStats(input: {
  records: NotarizationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): NotarizationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const notarizationizabilityPercent =
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
    notarizationizabilityPercent,
  }
}

export function getNotarizationizabilityAdminGuidance(input: {
  stats: NotarizationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect notarizationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial notarizationizability coverage and refresh the notarizationizability summary.'
  }

  if (input.stats.notarizationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership notarizationizability below the 95% target and refresh the notarizationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace notarizationizability coverage and refresh the notarizationizability summary.'
}

export function resolveNotarizationizabilityAdminActions(): NotarizationizabilityAdminAction[] {
  return ['refresh_notarizationizability_summary']
}
