import type {
  EncapsulizabilityAdminAction,
  EncapsulizabilityAdminRecord,
  EncapsulizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceEncapsulizabilityDomainInventory = {
  domain: EncapsulizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildEncapsulizabilityAdminRecords(
  inventory: WorkspaceEncapsulizabilityDomainInventory[],
): EncapsulizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildEncapsulizabilityAdminStats(input: {
  records: EncapsulizabilityAdminRecord[]
  postgresConnectivity: boolean
}): EncapsulizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const encapsulizabilityPercent =
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
    encapsulizabilityPercent,
  }
}

export function getEncapsulizabilityAdminGuidance(input: {
  stats: EncapsulizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect encapsulizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial encapsulizability coverage and refresh the encapsulizability summary.'
  }

  if (input.stats.encapsulizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan encapsulizability below the 95% target and refresh the encapsulizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace encapsulizability coverage and refresh the encapsulizability summary.'
}

export function resolveEncapsulizabilityAdminActions(): EncapsulizabilityAdminAction[] {
  return ['refresh_encapsulizability_summary']
}
