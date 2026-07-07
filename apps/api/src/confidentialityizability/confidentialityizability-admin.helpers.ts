import type {
  ConfidentialityizabilityAdminAction,
  ConfidentialityizabilityAdminRecord,
  ConfidentialityizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConfidentialityizabilityDomainInventory = {
  domain: ConfidentialityizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConfidentialityizabilityAdminRecords(
  inventory: WorkspaceConfidentialityizabilityDomainInventory[],
): ConfidentialityizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConfidentialityizabilityAdminStats(input: {
  records: ConfidentialityizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ConfidentialityizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const confidentialityizabilityPercent =
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
    confidentialityizabilityPercent,
  }
}

export function getConfidentialityizabilityAdminGuidance(input: {
  stats: ConfidentialityizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect confidentialityizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial confidentialityizability coverage and refresh the confidentialityizability summary.'
  }

  if (input.stats.confidentialityizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice confidentialityizability below the 95% target and refresh the confidentialityizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace confidentialityizability coverage and refresh the confidentialityizability summary.'
}

export function resolveConfidentialityizabilityAdminActions(): ConfidentialityizabilityAdminAction[] {
  return ['refresh_confidentialityizability_summary']
}
