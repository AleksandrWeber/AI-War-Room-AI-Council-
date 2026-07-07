import type {
  MitigationizabilityAdminAction,
  MitigationizabilityAdminRecord,
  MitigationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMitigationizabilityDomainInventory = {
  domain: MitigationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMitigationizabilityAdminRecords(
  inventory: WorkspaceMitigationizabilityDomainInventory[],
): MitigationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMitigationizabilityAdminStats(input: {
  records: MitigationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MitigationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const mitigationizabilityPercent =
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
    mitigationizabilityPercent,
  }
}

export function getMitigationizabilityAdminGuidance(input: {
  stats: MitigationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect mitigationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial mitigationizability coverage and refresh the mitigationizability summary.'
  }

  if (input.stats.mitigationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key mitigationizability below the 95% target and refresh the mitigationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace mitigationizability coverage and refresh the mitigationizability summary.'
}

export function resolveMitigationizabilityAdminActions(): MitigationizabilityAdminAction[] {
  return ['refresh_mitigationizability_summary']
}
