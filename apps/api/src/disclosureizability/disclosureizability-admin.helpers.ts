import type {
  DisclosureizabilityAdminAction,
  DisclosureizabilityAdminRecord,
  DisclosureizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDisclosureizabilityDomainInventory = {
  domain: DisclosureizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDisclosureizabilityAdminRecords(
  inventory: WorkspaceDisclosureizabilityDomainInventory[],
): DisclosureizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDisclosureizabilityAdminStats(input: {
  records: DisclosureizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DisclosureizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const disclosureizabilityPercent =
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
    disclosureizabilityPercent,
  }
}

export function getDisclosureizabilityAdminGuidance(input: {
  stats: DisclosureizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect disclosureizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial disclosureizability coverage and refresh the disclosureizability summary.'
  }

  if (input.stats.disclosureizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key disclosureizability below the 95% target and refresh the disclosureizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace disclosureizability coverage and refresh the disclosureizability summary.'
}

export function resolveDisclosureizabilityAdminActions(): DisclosureizabilityAdminAction[] {
  return ['refresh_disclosureizability_summary']
}
