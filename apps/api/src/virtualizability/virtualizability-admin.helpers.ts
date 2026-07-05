import type {
  VirtualizabilityAdminAction,
  VirtualizabilityAdminRecord,
  VirtualizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceVirtualizabilityDomainInventory = {
  domain: VirtualizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildVirtualizabilityAdminRecords(
  inventory: WorkspaceVirtualizabilityDomainInventory[],
): VirtualizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildVirtualizabilityAdminStats(input: {
  records: VirtualizabilityAdminRecord[]
  postgresConnectivity: boolean
}): VirtualizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const virtualizabilityPercent =
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
    virtualizabilityPercent,
  }
}

export function getVirtualizabilityAdminGuidance(input: {
  stats: VirtualizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect virtualizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial virtualizability coverage and refresh the virtualizability summary.'
  }

  if (input.stats.virtualizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook virtualizability below the 95% target and refresh the virtualizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace virtualizability coverage and refresh the virtualizability summary.'
}

export function resolveVirtualizabilityAdminActions(): VirtualizabilityAdminAction[] {
  return ['refresh_virtualizability_summary']
}
