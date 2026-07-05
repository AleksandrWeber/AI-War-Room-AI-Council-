import type {
  ContainerizabilityAdminAction,
  ContainerizabilityAdminRecord,
  ContainerizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceContainerizabilityDomainInventory = {
  domain: ContainerizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildContainerizabilityAdminRecords(
  inventory: WorkspaceContainerizabilityDomainInventory[],
): ContainerizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildContainerizabilityAdminStats(input: {
  records: ContainerizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ContainerizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const containerizabilityPercent =
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
    containerizabilityPercent,
  }
}

export function getContainerizabilityAdminGuidance(input: {
  stats: ContainerizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect containerizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial containerizability coverage and refresh the containerizability summary.'
  }

  if (input.stats.containerizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice containerizability below the 95% target and refresh the containerizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace containerizability coverage and refresh the containerizability summary.'
}

export function resolveContainerizabilityAdminActions(): ContainerizabilityAdminAction[] {
  return ['refresh_containerizability_summary']
}
