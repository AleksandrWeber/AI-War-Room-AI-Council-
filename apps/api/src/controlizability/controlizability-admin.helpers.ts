import type {
  ControlizabilityAdminAction,
  ControlizabilityAdminRecord,
  ControlizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceControlizabilityDomainInventory = {
  domain: ControlizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildControlizabilityAdminRecords(
  inventory: WorkspaceControlizabilityDomainInventory[],
): ControlizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildControlizabilityAdminStats(input: {
  records: ControlizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ControlizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const controlizabilityPercent =
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
    controlizabilityPercent,
  }
}

export function getControlizabilityAdminGuidance(input: {
  stats: ControlizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect controlizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial controlizability coverage and refresh the controlizability summary.'
  }

  if (input.stats.controlizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification controlizability below the 95% target and refresh the controlizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace controlizability coverage and refresh the controlizability summary.'
}

export function resolveControlizabilityAdminActions(): ControlizabilityAdminAction[] {
  return ['refresh_controlizability_summary']
}
