import type {
  IntegrabilizabilityAdminAction,
  IntegrabilizabilityAdminRecord,
  IntegrabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIntegrabilizabilityDomainInventory = {
  domain: IntegrabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIntegrabilizabilityAdminRecords(
  inventory: WorkspaceIntegrabilizabilityDomainInventory[],
): IntegrabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIntegrabilizabilityAdminStats(input: {
  records: IntegrabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): IntegrabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const integrabilizabilityPercent =
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
    integrabilizabilityPercent,
  }
}

export function getIntegrabilizabilityAdminGuidance(input: {
  stats: IntegrabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect integrabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial integrabilizability coverage and refresh the integrabilizability summary.'
  }

  if (input.stats.integrabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan integrabilizability below the 95% target and refresh the integrabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace integrabilizability coverage and refresh the integrabilizability summary.'
}

export function resolveIntegrabilizabilityAdminActions(): IntegrabilizabilityAdminAction[] {
  return ['refresh_integrabilizability_summary']
}
