import type {
  ReproducibilityvaultizabilityAdminAction,
  ReproducibilityvaultizabilityAdminRecord,
  ReproducibilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceReproducibilityvaultizabilityDomainInventory = {
  domain: ReproducibilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildReproducibilityvaultizabilityAdminRecords(
  inventory: WorkspaceReproducibilityvaultizabilityDomainInventory[],
): ReproducibilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildReproducibilityvaultizabilityAdminStats(input: {
  records: ReproducibilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ReproducibilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const reproducibilityvaultizabilityPercent =
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
    reproducibilityvaultizabilityPercent,
  }
}

export function getReproducibilityvaultizabilityAdminGuidance(input: {
  stats: ReproducibilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect reproducibilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial reproducibilityvaultizability coverage and refresh the reproducibilityvaultizability summary.'
  }

  if (input.stats.reproducibilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan reproducibilityvaultizability below the 95% target and refresh the reproducibilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace reproducibilityvaultizability coverage and refresh the reproducibilityvaultizability summary.'
}

export function resolveReproducibilityvaultizabilityAdminActions(): ReproducibilityvaultizabilityAdminAction[] {
  return ['refresh_reproducibilityvaultizability_summary']
}
