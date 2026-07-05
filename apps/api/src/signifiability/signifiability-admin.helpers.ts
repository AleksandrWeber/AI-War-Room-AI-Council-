import type {
  SignifiabilityAdminAction,
  SignifiabilityAdminRecord,
  SignifiabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSignifiabilityDomainInventory = {
  domain: SignifiabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSignifiabilityAdminRecords(
  inventory: WorkspaceSignifiabilityDomainInventory[],
): SignifiabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSignifiabilityAdminStats(input: {
  records: SignifiabilityAdminRecord[]
  postgresConnectivity: boolean
}): SignifiabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const signifiabilityPercent =
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
    signifiabilityPercent,
  }
}

export function getSignifiabilityAdminGuidance(input: {
  stats: SignifiabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect signifiability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial signifiability coverage and refresh the signifiability summary.'
  }

  if (input.stats.signifiabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook signifiability below the 95% target and refresh the signifiability summary.'
  }

  return 'Workspace owners and admins can inspect workspace signifiability coverage and refresh the signifiability summary.'
}

export function resolveSignifiabilityAdminActions(): SignifiabilityAdminAction[] {
  return ['refresh_signifiability_summary']
}
