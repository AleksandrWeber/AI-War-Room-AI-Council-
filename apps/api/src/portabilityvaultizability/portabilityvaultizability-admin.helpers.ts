import type {
  PortabilityvaultizabilityAdminAction,
  PortabilityvaultizabilityAdminRecord,
  PortabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePortabilityvaultizabilityDomainInventory = {
  domain: PortabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPortabilityvaultizabilityAdminRecords(
  inventory: WorkspacePortabilityvaultizabilityDomainInventory[],
): PortabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPortabilityvaultizabilityAdminStats(input: {
  records: PortabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PortabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const portabilityvaultizabilityPercent =
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
    portabilityvaultizabilityPercent,
  }
}

export function getPortabilityvaultizabilityAdminGuidance(input: {
  stats: PortabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect portabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial portabilityvaultizability coverage and refresh the portabilityvaultizability summary.'
  }

  if (input.stats.portabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification portabilityvaultizability below the 95% target and refresh the portabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace portabilityvaultizability coverage and refresh the portabilityvaultizability summary.'
}

export function resolvePortabilityvaultizabilityAdminActions(): PortabilityvaultizabilityAdminAction[] {
  return ['refresh_portabilityvaultizability_summary']
}
