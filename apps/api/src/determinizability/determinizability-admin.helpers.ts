import type {
  DeterminizabilityAdminAction,
  DeterminizabilityAdminRecord,
  DeterminizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDeterminizabilityDomainInventory = {
  domain: DeterminizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDeterminizabilityAdminRecords(
  inventory: WorkspaceDeterminizabilityDomainInventory[],
): DeterminizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDeterminizabilityAdminStats(input: {
  records: DeterminizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DeterminizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const determinizabilityPercent =
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
    determinizabilityPercent,
  }
}

export function getDeterminizabilityAdminGuidance(input: {
  stats: DeterminizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect determinizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial determinizability coverage and refresh the determinizability summary.'
  }

  if (input.stats.determinizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit determinizability below the 95% target and refresh the determinizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace determinizability coverage and refresh the determinizability summary.'
}

export function resolveDeterminizabilityAdminActions(): DeterminizabilityAdminAction[] {
  return ['refresh_determinizability_summary']
}
