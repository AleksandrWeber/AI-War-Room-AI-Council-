import type {
  TamperproofizabilityAdminAction,
  TamperproofizabilityAdminRecord,
  TamperproofizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTamperproofizabilityDomainInventory = {
  domain: TamperproofizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTamperproofizabilityAdminRecords(
  inventory: WorkspaceTamperproofizabilityDomainInventory[],
): TamperproofizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTamperproofizabilityAdminStats(input: {
  records: TamperproofizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TamperproofizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const tamperproofizabilityPercent =
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
    tamperproofizabilityPercent,
  }
}

export function getTamperproofizabilityAdminGuidance(input: {
  stats: TamperproofizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect tamperproofizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial tamperproofizability coverage and refresh the tamperproofizability summary.'
  }

  if (input.stats.tamperproofizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification tamperproofizability below the 95% target and refresh the tamperproofizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace tamperproofizability coverage and refresh the tamperproofizability summary.'
}

export function resolveTamperproofizabilityAdminActions(): TamperproofizabilityAdminAction[] {
  return ['refresh_tamperproofizability_summary']
}
