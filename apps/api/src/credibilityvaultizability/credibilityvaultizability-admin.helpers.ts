import type {
  CredibilityvaultizabilityAdminAction,
  CredibilityvaultizabilityAdminRecord,
  CredibilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCredibilityvaultizabilityDomainInventory = {
  domain: CredibilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCredibilityvaultizabilityAdminRecords(
  inventory: WorkspaceCredibilityvaultizabilityDomainInventory[],
): CredibilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCredibilityvaultizabilityAdminStats(input: {
  records: CredibilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CredibilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const credibilityvaultizabilityPercent =
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
    credibilityvaultizabilityPercent,
  }
}

export function getCredibilityvaultizabilityAdminGuidance(input: {
  stats: CredibilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect credibilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial credibilityvaultizability coverage and refresh the credibilityvaultizability summary.'
  }

  if (input.stats.credibilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification credibilityvaultizability below the 95% target and refresh the credibilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace credibilityvaultizability coverage and refresh the credibilityvaultizability summary.'
}

export function resolveCredibilityvaultizabilityAdminActions(): CredibilityvaultizabilityAdminAction[] {
  return ['refresh_credibilityvaultizability_summary']
}
