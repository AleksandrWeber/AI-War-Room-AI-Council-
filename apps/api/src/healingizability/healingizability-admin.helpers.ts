import type {
  HealingizabilityAdminAction,
  HealingizabilityAdminRecord,
  HealingizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceHealingizabilityDomainInventory = {
  domain: HealingizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildHealingizabilityAdminRecords(
  inventory: WorkspaceHealingizabilityDomainInventory[],
): HealingizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildHealingizabilityAdminStats(input: {
  records: HealingizabilityAdminRecord[]
  postgresConnectivity: boolean
}): HealingizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const healingizabilityPercent =
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
    healingizabilityPercent,
  }
}

export function getHealingizabilityAdminGuidance(input: {
  stats: HealingizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect healingizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial healingizability coverage and refresh the healingizability summary.'
  }

  if (input.stats.healingizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership healingizability below the 95% target and refresh the healingizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace healingizability coverage and refresh the healingizability summary.'
}

export function resolveHealingizabilityAdminActions(): HealingizabilityAdminAction[] {
  return ['refresh_healingizability_summary']
}
