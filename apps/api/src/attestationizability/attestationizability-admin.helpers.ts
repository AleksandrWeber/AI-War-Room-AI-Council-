import type {
  AttestationizabilityAdminAction,
  AttestationizabilityAdminRecord,
  AttestationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAttestationizabilityDomainInventory = {
  domain: AttestationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAttestationizabilityAdminRecords(
  inventory: WorkspaceAttestationizabilityDomainInventory[],
): AttestationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAttestationizabilityAdminStats(input: {
  records: AttestationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AttestationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const attestationizabilityPercent =
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
    attestationizabilityPercent,
  }
}

export function getAttestationizabilityAdminGuidance(input: {
  stats: AttestationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect attestationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial attestationizability coverage and refresh the attestationizability summary.'
  }

  if (input.stats.attestationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification attestationizability below the 95% target and refresh the attestationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace attestationizability coverage and refresh the attestationizability summary.'
}

export function resolveAttestationizabilityAdminActions(): AttestationizabilityAdminAction[] {
  return ['refresh_attestationizability_summary']
}
