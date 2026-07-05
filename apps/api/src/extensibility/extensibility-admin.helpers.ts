import type {
  ExtensibilityAdminAction,
  ExtensibilityAdminRecord,
  ExtensibilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceExtensibilityDomainInventory = {
  domain: ExtensibilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildExtensibilityAdminRecords(
  inventory: WorkspaceExtensibilityDomainInventory[],
): ExtensibilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildExtensibilityAdminStats(input: {
  records: ExtensibilityAdminRecord[]
  postgresConnectivity: boolean
}): ExtensibilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'agent_outputs')
      ?.recordCount ?? 0
  const extensibilityPercent =
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
    extensibilityPercent,
  }
}

export function getExtensibilityAdminGuidance(input: {
  stats: ExtensibilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect extensibility metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial extensibility coverage and refresh the extensibility summary.'
  }

  if (input.stats.extensibilityPercent < 95) {
    return 'Workspace owners and admins can inspect agent output extensibility below the 95% target and refresh the extensibility summary.'
  }

  return 'Workspace owners and admins can inspect workspace extensibility coverage and refresh the extensibility summary.'
}

export function resolveExtensibilityAdminActions(): ExtensibilityAdminAction[] {
  return ['refresh_extensibility_summary']
}
