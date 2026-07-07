import type {
  AccesscontrolizabilityAdminAction,
  AccesscontrolizabilityAdminRecord,
  AccesscontrolizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAccesscontrolizabilityDomainInventory = {
  domain: AccesscontrolizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAccesscontrolizabilityAdminRecords(
  inventory: WorkspaceAccesscontrolizabilityDomainInventory[],
): AccesscontrolizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAccesscontrolizabilityAdminStats(input: {
  records: AccesscontrolizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AccesscontrolizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const accesscontrolizabilityPercent =
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
    accesscontrolizabilityPercent,
  }
}

export function getAccesscontrolizabilityAdminGuidance(input: {
  stats: AccesscontrolizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect accesscontrolizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial accesscontrolizability coverage and refresh the accesscontrolizability summary.'
  }

  if (input.stats.accesscontrolizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key accesscontrolizability below the 95% target and refresh the accesscontrolizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace accesscontrolizability coverage and refresh the accesscontrolizability summary.'
}

export function resolveAccesscontrolizabilityAdminActions(): AccesscontrolizabilityAdminAction[] {
  return ['refresh_accesscontrolizability_summary']
}
