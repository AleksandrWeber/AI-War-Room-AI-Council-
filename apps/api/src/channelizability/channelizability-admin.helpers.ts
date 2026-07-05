import type {
  ChannelizabilityAdminAction,
  ChannelizabilityAdminRecord,
  ChannelizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceChannelizabilityDomainInventory = {
  domain: ChannelizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildChannelizabilityAdminRecords(
  inventory: WorkspaceChannelizabilityDomainInventory[],
): ChannelizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildChannelizabilityAdminStats(input: {
  records: ChannelizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ChannelizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const channelizabilityPercent =
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
    channelizabilityPercent,
  }
}

export function getChannelizabilityAdminGuidance(input: {
  stats: ChannelizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect channelizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial channelizability coverage and refresh the channelizability summary.'
  }

  if (input.stats.channelizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice channelizability below the 95% target and refresh the channelizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace channelizability coverage and refresh the channelizability summary.'
}

export function resolveChannelizabilityAdminActions(): ChannelizabilityAdminAction[] {
  return ['refresh_channelizability_summary']
}
