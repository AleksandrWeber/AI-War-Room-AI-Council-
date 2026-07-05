import type {
  ContextualizabilityAdminAction,
  ContextualizabilityAdminRecord,
  ContextualizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceContextualizabilityDomainInventory = {
  domain: ContextualizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildContextualizabilityAdminRecords(
  inventory: WorkspaceContextualizabilityDomainInventory[],
): ContextualizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildContextualizabilityAdminStats(input: {
  records: ContextualizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ContextualizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const contextualizabilityPercent =
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
    contextualizabilityPercent,
  }
}

export function getContextualizabilityAdminGuidance(input: {
  stats: ContextualizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect contextualizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial contextualizability coverage and refresh the contextualizability summary.'
  }

  if (input.stats.contextualizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook contextualizability below the 95% target and refresh the contextualizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace contextualizability coverage and refresh the contextualizability summary.'
}

export function resolveContextualizabilityAdminActions(): ContextualizabilityAdminAction[] {
  return ['refresh_contextualizability_summary']
}
