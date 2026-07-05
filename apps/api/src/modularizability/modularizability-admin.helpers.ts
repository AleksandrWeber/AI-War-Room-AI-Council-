import type {
  ModularizabilityAdminAction,
  ModularizabilityAdminRecord,
  ModularizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceModularizabilityDomainInventory = {
  domain: ModularizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildModularizabilityAdminRecords(
  inventory: WorkspaceModularizabilityDomainInventory[],
): ModularizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildModularizabilityAdminStats(input: {
  records: ModularizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ModularizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const modularizabilityPercent =
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
    modularizabilityPercent,
  }
}

export function getModularizabilityAdminGuidance(input: {
  stats: ModularizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect modularizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial modularizability coverage and refresh the modularizability summary.'
  }

  if (input.stats.modularizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership modularizability below the 95% target and refresh the modularizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace modularizability coverage and refresh the modularizability summary.'
}

export function resolveModularizabilityAdminActions(): ModularizabilityAdminAction[] {
  return ['refresh_modularizability_summary']
}
