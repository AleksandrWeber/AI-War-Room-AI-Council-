import type {
  AttesttrackizabilityAdminAction,
  AttesttrackizabilityAdminRecord,
  AttesttrackizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAttesttrackizabilityDomainInventory = {
  domain: AttesttrackizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAttesttrackizabilityAdminRecords(
  inventory: WorkspaceAttesttrackizabilityDomainInventory[],
): AttesttrackizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAttesttrackizabilityAdminStats(input: {
  records: AttesttrackizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AttesttrackizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const attesttrackizabilityPercent =
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
    attesttrackizabilityPercent,
  }
}

export function getAttesttrackizabilityAdminGuidance(input: {
  stats: AttesttrackizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect attesttrackizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial attesttrackizability coverage and refresh the attesttrackizability summary.'
  }

  if (input.stats.attesttrackizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership attesttrackizability below the 95% target and refresh the attesttrackizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace attesttrackizability coverage and refresh the attesttrackizability summary.'
}

export function resolveAttesttrackizabilityAdminActions(): AttesttrackizabilityAdminAction[] {
  return ['refresh_attesttrackizability_summary']
}
