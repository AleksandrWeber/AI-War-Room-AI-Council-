import type {
  ReferencabilityAdminAction,
  ReferencabilityAdminRecord,
  ReferencabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceReferencabilityDomainInventory = {
  domain: ReferencabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildReferencabilityAdminRecords(
  inventory: WorkspaceReferencabilityDomainInventory[],
): ReferencabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildReferencabilityAdminStats(input: {
  records: ReferencabilityAdminRecord[]
  postgresConnectivity: boolean
}): ReferencabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'artifacts')
      ?.recordCount ?? 0
  const referencabilityPercent =
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
    referencabilityPercent,
  }
}

export function getReferencabilityAdminGuidance(input: {
  stats: ReferencabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect referencability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial referencability coverage and refresh the referencability summary.'
  }

  if (input.stats.referencabilityPercent < 95) {
    return 'Workspace owners and admins can inspect artifact referencability below the 95% target and refresh the referencability summary.'
  }

  return 'Workspace owners and admins can inspect workspace referencability coverage and refresh the referencability summary.'
}

export function resolveReferencabilityAdminActions(): ReferencabilityAdminAction[] {
  return ['refresh_referencability_summary']
}
