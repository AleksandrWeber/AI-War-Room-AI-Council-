import type {
  UpgradizabilityAdminAction,
  UpgradizabilityAdminRecord,
  UpgradizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceUpgradizabilityDomainInventory = {
  domain: UpgradizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildUpgradizabilityAdminRecords(
  inventory: WorkspaceUpgradizabilityDomainInventory[],
): UpgradizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildUpgradizabilityAdminStats(input: {
  records: UpgradizabilityAdminRecord[]
  postgresConnectivity: boolean
}): UpgradizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const upgradizabilityPercent =
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
    upgradizabilityPercent,
  }
}

export function getUpgradizabilityAdminGuidance(input: {
  stats: UpgradizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect upgradizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial upgradizability coverage and refresh the upgradizability summary.'
  }

  if (input.stats.upgradizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential upgradizability below the 95% target and refresh the upgradizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace upgradizability coverage and refresh the upgradizability summary.'
}

export function resolveUpgradizabilityAdminActions(): UpgradizabilityAdminAction[] {
  return ['refresh_upgradizability_summary']
}
