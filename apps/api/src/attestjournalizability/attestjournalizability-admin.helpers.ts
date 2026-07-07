import type {
  AttestjournalizabilityAdminAction,
  AttestjournalizabilityAdminRecord,
  AttestjournalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAttestjournalizabilityDomainInventory = {
  domain: AttestjournalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAttestjournalizabilityAdminRecords(
  inventory: WorkspaceAttestjournalizabilityDomainInventory[],
): AttestjournalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAttestjournalizabilityAdminStats(input: {
  records: AttestjournalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AttestjournalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const attestjournalizabilityPercent =
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
    attestjournalizabilityPercent,
  }
}

export function getAttestjournalizabilityAdminGuidance(input: {
  stats: AttestjournalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect attestjournalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial attestjournalizability coverage and refresh the attestjournalizability summary.'
  }

  if (input.stats.attestjournalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan attestjournalizability below the 95% target and refresh the attestjournalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace attestjournalizability coverage and refresh the attestjournalizability summary.'
}

export function resolveAttestjournalizabilityAdminActions(): AttestjournalizabilityAdminAction[] {
  return ['refresh_attestjournalizability_summary']
}
