import type {
  BoundarizabilityAdminAction,
  BoundarizabilityAdminRecord,
  BoundarizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceBoundarizabilityDomainInventory = {
  domain: BoundarizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildBoundarizabilityAdminRecords(
  inventory: WorkspaceBoundarizabilityDomainInventory[],
): BoundarizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildBoundarizabilityAdminStats(input: {
  records: BoundarizabilityAdminRecord[]
  postgresConnectivity: boolean
}): BoundarizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const boundarizabilityPercent =
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
    boundarizabilityPercent,
  }
}

export function getBoundarizabilityAdminGuidance(input: {
  stats: BoundarizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect boundarizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial boundarizability coverage and refresh the boundarizability summary.'
  }

  if (input.stats.boundarizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification boundarizability below the 95% target and refresh the boundarizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace boundarizability coverage and refresh the boundarizability summary.'
}

export function resolveBoundarizabilityAdminActions(): BoundarizabilityAdminAction[] {
  return ['refresh_boundarizability_summary']
}
