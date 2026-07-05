import type {
  AxiologizabilityAdminAction,
  AxiologizabilityAdminRecord,
  AxiologizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAxiologizabilityDomainInventory = {
  domain: AxiologizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAxiologizabilityAdminRecords(
  inventory: WorkspaceAxiologizabilityDomainInventory[],
): AxiologizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAxiologizabilityAdminStats(input: {
  records: AxiologizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AxiologizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const axiologizabilityPercent =
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
    axiologizabilityPercent,
  }
}

export function getAxiologizabilityAdminGuidance(input: {
  stats: AxiologizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect axiologizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial axiologizability coverage and refresh the axiologizability summary.'
  }

  if (input.stats.axiologizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification axiologizability below the 95% target and refresh the axiologizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace axiologizability coverage and refresh the axiologizability summary.'
}

export function resolveAxiologizabilityAdminActions(): AxiologizabilityAdminAction[] {
  return ['refresh_axiologizability_summary']
}
