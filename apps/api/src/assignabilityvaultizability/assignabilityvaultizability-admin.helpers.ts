import type {
  AssignabilityvaultizabilityAdminAction,
  AssignabilityvaultizabilityAdminRecord,
  AssignabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAssignabilityvaultizabilityDomainInventory = {
  domain: AssignabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAssignabilityvaultizabilityAdminRecords(
  inventory: WorkspaceAssignabilityvaultizabilityDomainInventory[],
): AssignabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAssignabilityvaultizabilityAdminStats(input: {
  records: AssignabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AssignabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const assignabilityvaultizabilityPercent =
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
    assignabilityvaultizabilityPercent,
  }
}

export function getAssignabilityvaultizabilityAdminGuidance(input: {
  stats: AssignabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect assignabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial assignabilityvaultizability coverage and refresh the assignabilityvaultizability summary.'
  }

  if (input.stats.assignabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification assignabilityvaultizability below the 95% target and refresh the assignabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace assignabilityvaultizability coverage and refresh the assignabilityvaultizability summary.'
}

export function resolveAssignabilityvaultizabilityAdminActions(): AssignabilityvaultizabilityAdminAction[] {
  return ['refresh_assignabilityvaultizability_summary']
}
