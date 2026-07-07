import type {
  ModifiabilityvaultizabilityAdminAction,
  ModifiabilityvaultizabilityAdminRecord,
  ModifiabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceModifiabilityvaultizabilityDomainInventory = {
  domain: ModifiabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildModifiabilityvaultizabilityAdminRecords(
  inventory: WorkspaceModifiabilityvaultizabilityDomainInventory[],
): ModifiabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildModifiabilityvaultizabilityAdminStats(input: {
  records: ModifiabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ModifiabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const modifiabilityvaultizabilityPercent =
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
    modifiabilityvaultizabilityPercent,
  }
}

export function getModifiabilityvaultizabilityAdminGuidance(input: {
  stats: ModifiabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect modifiabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial modifiabilityvaultizability coverage and refresh the modifiabilityvaultizability summary.'
  }

  if (input.stats.modifiabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification modifiabilityvaultizability below the 95% target and refresh the modifiabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace modifiabilityvaultizability coverage and refresh the modifiabilityvaultizability summary.'
}

export function resolveModifiabilityvaultizabilityAdminActions(): ModifiabilityvaultizabilityAdminAction[] {
  return ['refresh_modifiabilityvaultizability_summary']
}
