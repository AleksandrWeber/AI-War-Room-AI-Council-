import type {
  OrderingizabilityAdminAction,
  OrderingizabilityAdminRecord,
  OrderingizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceOrderingizabilityDomainInventory = {
  domain: OrderingizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildOrderingizabilityAdminRecords(
  inventory: WorkspaceOrderingizabilityDomainInventory[],
): OrderingizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildOrderingizabilityAdminStats(input: {
  records: OrderingizabilityAdminRecord[]
  postgresConnectivity: boolean
}): OrderingizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const orderingizabilityPercent =
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
    orderingizabilityPercent,
  }
}

export function getOrderingizabilityAdminGuidance(input: {
  stats: OrderingizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect orderingizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial orderingizability coverage and refresh the orderingizability summary.'
  }

  if (input.stats.orderingizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership orderingizability below the 95% target and refresh the orderingizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace orderingizability coverage and refresh the orderingizability summary.'
}

export function resolveOrderingizabilityAdminActions(): OrderingizabilityAdminAction[] {
  return ['refresh_orderingizability_summary']
}
