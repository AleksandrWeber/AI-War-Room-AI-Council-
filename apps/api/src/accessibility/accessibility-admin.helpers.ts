import type {
  AccessibilityAdminAction,
  AccessibilityAdminRecord,
  AccessibilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAccessibilityDomainInventory = {
  domain: AccessibilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAccessibilityAdminRecords(
  inventory: WorkspaceAccessibilityDomainInventory[],
): AccessibilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAccessibilityAdminStats(input: {
  records: AccessibilityAdminRecord[]
  postgresConnectivity: boolean
}): AccessibilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const accessibilityPercent =
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
    accessibilityPercent,
  }
}

export function getAccessibilityAdminGuidance(input: {
  stats: AccessibilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect accessibility metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial accessibility coverage and refresh the accessibility summary.'
  }

  if (input.stats.accessibilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key accessibility below the 95% target and refresh the accessibility summary.'
  }

  return 'Workspace owners and admins can inspect workspace accessibility coverage and refresh the accessibility summary.'
}

export function resolveAccessibilityAdminActions(): AccessibilityAdminAction[] {
  return ['refresh_accessibility_summary']
}
