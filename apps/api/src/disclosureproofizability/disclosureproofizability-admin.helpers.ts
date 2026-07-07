import type {
  DisclosureproofizabilityAdminAction,
  DisclosureproofizabilityAdminRecord,
  DisclosureproofizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDisclosureproofizabilityDomainInventory = {
  domain: DisclosureproofizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDisclosureproofizabilityAdminRecords(
  inventory: WorkspaceDisclosureproofizabilityDomainInventory[],
): DisclosureproofizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDisclosureproofizabilityAdminStats(input: {
  records: DisclosureproofizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DisclosureproofizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const disclosureproofizabilityPercent =
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
    disclosureproofizabilityPercent,
  }
}

export function getDisclosureproofizabilityAdminGuidance(input: {
  stats: DisclosureproofizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect disclosureproofizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial disclosureproofizability coverage and refresh the disclosureproofizability summary.'
  }

  if (input.stats.disclosureproofizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key disclosureproofizability below the 95% target and refresh the disclosureproofizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace disclosureproofizability coverage and refresh the disclosureproofizability summary.'
}

export function resolveDisclosureproofizabilityAdminActions(): DisclosureproofizabilityAdminAction[] {
  return ['refresh_disclosureproofizability_summary']
}
