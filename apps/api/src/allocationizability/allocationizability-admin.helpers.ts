import type {
  AllocationizabilityAdminAction,
  AllocationizabilityAdminRecord,
  AllocationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAllocationizabilityDomainInventory = {
  domain: AllocationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAllocationizabilityAdminRecords(
  inventory: WorkspaceAllocationizabilityDomainInventory[],
): AllocationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAllocationizabilityAdminStats(input: {
  records: AllocationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AllocationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const allocationizabilityPercent =
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
    allocationizabilityPercent,
  }
}

export function getAllocationizabilityAdminGuidance(input: {
  stats: AllocationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect allocationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial allocationizability coverage and refresh the allocationizability summary.'
  }

  if (input.stats.allocationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential allocationizability below the 95% target and refresh the allocationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace allocationizability coverage and refresh the allocationizability summary.'
}

export function resolveAllocationizabilityAdminActions(): AllocationizabilityAdminAction[] {
  return ['refresh_allocationizability_summary']
}
