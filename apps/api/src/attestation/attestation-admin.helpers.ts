import type {
  AttestationAdminAction,
  AttestationAdminRecord,
  AttestationAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAttestationDomainInventory = {
  domain: AttestationAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAttestationAdminRecords(
  inventory: WorkspaceAttestationDomainInventory[],
): AttestationAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAttestationAdminStats(input: {
  records: AttestationAdminRecord[]
  postgresConnectivity: boolean
}): AttestationAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'provider_credentials')
      ?.recordCount ?? 0
  const attestationPercent =
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
    attestationPercent,
  }
}

export function getAttestationAdminGuidance(input: {
  stats: AttestationAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect attestation metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial attestation coverage and refresh the attestation summary.'
  }

  if (input.stats.attestationPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential attestation below the 95% target and refresh the attestation summary.'
  }

  return 'Workspace owners and admins can inspect workspace attestation coverage and refresh the attestation summary.'
}

export function resolveAttestationAdminActions(): AttestationAdminAction[] {
  return ['refresh_attestation_summary']
}
