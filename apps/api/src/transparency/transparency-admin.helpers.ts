import type {
  TransparencyAdminAction,
  TransparencyAdminRecord,
  TransparencyAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTransparencyDomainInventory = {
  domain: TransparencyAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTransparencyAdminRecords(
  inventory: WorkspaceTransparencyDomainInventory[],
): TransparencyAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTransparencyAdminStats(input: {
  records: TransparencyAdminRecord[]
  postgresConnectivity: boolean
}): TransparencyAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const runWorkflows =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const transparencyPercent =
    completedRuns === 0
      ? 100
      : Math.min(100, Math.round((runWorkflows / completedRuns) * 100))

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    transparencyPercent,
  }
}

export function getTransparencyAdminGuidance(input: {
  stats: TransparencyAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect transparency metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial transparency coverage and refresh the transparency summary.'
  }

  if (input.stats.transparencyPercent < 95) {
    return 'Workspace owners and admins can inspect workflow transparency below the 95% target and refresh the transparency summary.'
  }

  return 'Workspace owners and admins can inspect workspace transparency coverage and refresh the transparency summary.'
}

export function resolveTransparencyAdminActions(): TransparencyAdminAction[] {
  return ['refresh_transparency_summary']
}
