import type {
  KeymanagementizabilityAdminAction,
  KeymanagementizabilityAdminRecord,
  KeymanagementizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceKeymanagementizabilityDomainInventory = {
  domain: KeymanagementizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildKeymanagementizabilityAdminRecords(
  inventory: WorkspaceKeymanagementizabilityDomainInventory[],
): KeymanagementizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildKeymanagementizabilityAdminStats(input: {
  records: KeymanagementizabilityAdminRecord[]
  postgresConnectivity: boolean
}): KeymanagementizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const keymanagementizabilityPercent =
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
    keymanagementizabilityPercent,
  }
}

export function getKeymanagementizabilityAdminGuidance(input: {
  stats: KeymanagementizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect keymanagementizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial keymanagementizability coverage and refresh the keymanagementizability summary.'
  }

  if (input.stats.keymanagementizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership keymanagementizability below the 95% target and refresh the keymanagementizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace keymanagementizability coverage and refresh the keymanagementizability summary.'
}

export function resolveKeymanagementizabilityAdminActions(): KeymanagementizabilityAdminAction[] {
  return ['refresh_keymanagementizability_summary']
}
