import type {
  HandoffizabilityAdminAction,
  HandoffizabilityAdminRecord,
  HandoffizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceHandoffizabilityDomainInventory = {
  domain: HandoffizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildHandoffizabilityAdminRecords(
  inventory: WorkspaceHandoffizabilityDomainInventory[],
): HandoffizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildHandoffizabilityAdminStats(input: {
  records: HandoffizabilityAdminRecord[]
  postgresConnectivity: boolean
}): HandoffizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const handoffizabilityPercent =
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
    handoffizabilityPercent,
  }
}

export function getHandoffizabilityAdminGuidance(input: {
  stats: HandoffizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect handoffizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial handoffizability coverage and refresh the handoffizability summary.'
  }

  if (input.stats.handoffizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan handoffizability below the 95% target and refresh the handoffizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace handoffizability coverage and refresh the handoffizability summary.'
}

export function resolveHandoffizabilityAdminActions(): HandoffizabilityAdminAction[] {
  return ['refresh_handoffizability_summary']
}
