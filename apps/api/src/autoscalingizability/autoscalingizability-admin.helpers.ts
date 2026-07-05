import type {
  AutoscalingizabilityAdminAction,
  AutoscalingizabilityAdminRecord,
  AutoscalingizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAutoscalingizabilityDomainInventory = {
  domain: AutoscalingizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAutoscalingizabilityAdminRecords(
  inventory: WorkspaceAutoscalingizabilityDomainInventory[],
): AutoscalingizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAutoscalingizabilityAdminStats(input: {
  records: AutoscalingizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AutoscalingizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const autoscalingizabilityPercent =
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
    autoscalingizabilityPercent,
  }
}

export function getAutoscalingizabilityAdminGuidance(input: {
  stats: AutoscalingizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect autoscalingizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial autoscalingizability coverage and refresh the autoscalingizability summary.'
  }

  if (input.stats.autoscalingizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential autoscalingizability below the 95% target and refresh the autoscalingizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace autoscalingizability coverage and refresh the autoscalingizability summary.'
}

export function resolveAutoscalingizabilityAdminActions(): AutoscalingizabilityAdminAction[] {
  return ['refresh_autoscalingizability_summary']
}
