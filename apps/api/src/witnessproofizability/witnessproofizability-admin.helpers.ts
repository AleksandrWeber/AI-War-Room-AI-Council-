import type {
  WitnessproofizabilityAdminAction,
  WitnessproofizabilityAdminRecord,
  WitnessproofizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceWitnessproofizabilityDomainInventory = {
  domain: WitnessproofizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildWitnessproofizabilityAdminRecords(
  inventory: WorkspaceWitnessproofizabilityDomainInventory[],
): WitnessproofizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildWitnessproofizabilityAdminStats(input: {
  records: WitnessproofizabilityAdminRecord[]
  postgresConnectivity: boolean
}): WitnessproofizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const witnessproofizabilityPercent =
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
    witnessproofizabilityPercent,
  }
}

export function getWitnessproofizabilityAdminGuidance(input: {
  stats: WitnessproofizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect witnessproofizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial witnessproofizability coverage and refresh the witnessproofizability summary.'
  }

  if (input.stats.witnessproofizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification witnessproofizability below the 95% target and refresh the witnessproofizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace witnessproofizability coverage and refresh the witnessproofizability summary.'
}

export function resolveWitnessproofizabilityAdminActions(): WitnessproofizabilityAdminAction[] {
  return ['refresh_witnessproofizability_summary']
}
