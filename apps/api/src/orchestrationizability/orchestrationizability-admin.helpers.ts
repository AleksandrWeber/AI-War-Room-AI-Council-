import type {
  OrchestrationizabilityAdminAction,
  OrchestrationizabilityAdminRecord,
  OrchestrationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceOrchestrationizabilityDomainInventory = {
  domain: OrchestrationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildOrchestrationizabilityAdminRecords(
  inventory: WorkspaceOrchestrationizabilityDomainInventory[],
): OrchestrationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildOrchestrationizabilityAdminStats(input: {
  records: OrchestrationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): OrchestrationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const orchestrationizabilityPercent =
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
    orchestrationizabilityPercent,
  }
}

export function getOrchestrationizabilityAdminGuidance(input: {
  stats: OrchestrationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect orchestrationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial orchestrationizability coverage and refresh the orchestrationizability summary.'
  }

  if (input.stats.orchestrationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook orchestrationizability below the 95% target and refresh the orchestrationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace orchestrationizability coverage and refresh the orchestrationizability summary.'
}

export function resolveOrchestrationizabilityAdminActions(): OrchestrationizabilityAdminAction[] {
  return ['refresh_orchestrationizability_summary']
}
