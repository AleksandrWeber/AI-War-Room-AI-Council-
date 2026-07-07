import type {
  SubstantiabilityvaultizabilityAdminAction,
  SubstantiabilityvaultizabilityAdminRecord,
  SubstantiabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSubstantiabilityvaultizabilityDomainInventory = {
  domain: SubstantiabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSubstantiabilityvaultizabilityAdminRecords(
  inventory: WorkspaceSubstantiabilityvaultizabilityDomainInventory[],
): SubstantiabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSubstantiabilityvaultizabilityAdminStats(input: {
  records: SubstantiabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SubstantiabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const substantiabilityvaultizabilityPercent =
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
    substantiabilityvaultizabilityPercent,
  }
}

export function getSubstantiabilityvaultizabilityAdminGuidance(input: {
  stats: SubstantiabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect substantiabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial substantiabilityvaultizability coverage and refresh the substantiabilityvaultizability summary.'
  }

  if (input.stats.substantiabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan substantiabilityvaultizability below the 95% target and refresh the substantiabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace substantiabilityvaultizability coverage and refresh the substantiabilityvaultizability summary.'
}

export function resolveSubstantiabilityvaultizabilityAdminActions(): SubstantiabilityvaultizabilityAdminAction[] {
  return ['refresh_substantiabilityvaultizability_summary']
}
