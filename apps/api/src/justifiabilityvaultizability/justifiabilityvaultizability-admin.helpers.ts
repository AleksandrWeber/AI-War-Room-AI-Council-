import type {
  JustifiabilityvaultizabilityAdminAction,
  JustifiabilityvaultizabilityAdminRecord,
  JustifiabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceJustifiabilityvaultizabilityDomainInventory = {
  domain: JustifiabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildJustifiabilityvaultizabilityAdminRecords(
  inventory: WorkspaceJustifiabilityvaultizabilityDomainInventory[],
): JustifiabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildJustifiabilityvaultizabilityAdminStats(input: {
  records: JustifiabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): JustifiabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const justifiabilityvaultizabilityPercent =
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
    justifiabilityvaultizabilityPercent,
  }
}

export function getJustifiabilityvaultizabilityAdminGuidance(input: {
  stats: JustifiabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect justifiabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial justifiabilityvaultizability coverage and refresh the justifiabilityvaultizability summary.'
  }

  if (input.stats.justifiabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan justifiabilityvaultizability below the 95% target and refresh the justifiabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace justifiabilityvaultizability coverage and refresh the justifiabilityvaultizability summary.'
}

export function resolveJustifiabilityvaultizabilityAdminActions(): JustifiabilityvaultizabilityAdminAction[] {
  return ['refresh_justifiabilityvaultizability_summary']
}
