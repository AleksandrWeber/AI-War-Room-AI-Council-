import type {
  ReleasizabilityAdminAction,
  ReleasizabilityAdminRecord,
  ReleasizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceReleasizabilityDomainInventory = {
  domain: ReleasizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildReleasizabilityAdminRecords(
  inventory: WorkspaceReleasizabilityDomainInventory[],
): ReleasizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildReleasizabilityAdminStats(input: {
  records: ReleasizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ReleasizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const releasizabilityPercent =
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
    releasizabilityPercent,
  }
}

export function getReleasizabilityAdminGuidance(input: {
  stats: ReleasizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect releasizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial releasizability coverage and refresh the releasizability summary.'
  }

  if (input.stats.releasizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook releasizability below the 95% target and refresh the releasizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace releasizability coverage and refresh the releasizability summary.'
}

export function resolveReleasizabilityAdminActions(): ReleasizabilityAdminAction[] {
  return ['refresh_releasizability_summary']
}
