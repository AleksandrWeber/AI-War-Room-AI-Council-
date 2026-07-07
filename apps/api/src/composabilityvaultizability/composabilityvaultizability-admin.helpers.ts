import type {
  ComposabilityvaultizabilityAdminAction,
  ComposabilityvaultizabilityAdminRecord,
  ComposabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceComposabilityvaultizabilityDomainInventory = {
  domain: ComposabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildComposabilityvaultizabilityAdminRecords(
  inventory: WorkspaceComposabilityvaultizabilityDomainInventory[],
): ComposabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildComposabilityvaultizabilityAdminStats(input: {
  records: ComposabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ComposabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const composabilityvaultizabilityPercent =
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
    composabilityvaultizabilityPercent,
  }
}

export function getComposabilityvaultizabilityAdminGuidance(input: {
  stats: ComposabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect composabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial composabilityvaultizability coverage and refresh the composabilityvaultizability summary.'
  }

  if (input.stats.composabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan composabilityvaultizability below the 95% target and refresh the composabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace composabilityvaultizability coverage and refresh the composabilityvaultizability summary.'
}

export function resolveComposabilityvaultizabilityAdminActions(): ComposabilityvaultizabilityAdminAction[] {
  return ['refresh_composabilityvaultizability_summary']
}
