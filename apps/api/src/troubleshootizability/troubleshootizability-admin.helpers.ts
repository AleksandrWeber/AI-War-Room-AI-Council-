import type {
  TroubleshootizabilityAdminAction,
  TroubleshootizabilityAdminRecord,
  TroubleshootizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTroubleshootizabilityDomainInventory = {
  domain: TroubleshootizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTroubleshootizabilityAdminRecords(
  inventory: WorkspaceTroubleshootizabilityDomainInventory[],
): TroubleshootizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTroubleshootizabilityAdminStats(input: {
  records: TroubleshootizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TroubleshootizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const troubleshootizabilityPercent =
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
    troubleshootizabilityPercent,
  }
}

export function getTroubleshootizabilityAdminGuidance(input: {
  stats: TroubleshootizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect troubleshootizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial troubleshootizability coverage and refresh the troubleshootizability summary.'
  }

  if (input.stats.troubleshootizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification troubleshootizability below the 95% target and refresh the troubleshootizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace troubleshootizability coverage and refresh the troubleshootizability summary.'
}

export function resolveTroubleshootizabilityAdminActions(): TroubleshootizabilityAdminAction[] {
  return ['refresh_troubleshootizability_summary']
}
