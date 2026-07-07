import type {
  AttestationvaultizabilityAdminAction,
  AttestationvaultizabilityAdminRecord,
  AttestationvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAttestationvaultizabilityDomainInventory = {
  domain: AttestationvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAttestationvaultizabilityAdminRecords(
  inventory: WorkspaceAttestationvaultizabilityDomainInventory[],
): AttestationvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAttestationvaultizabilityAdminStats(input: {
  records: AttestationvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AttestationvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const attestationvaultizabilityPercent =
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
    attestationvaultizabilityPercent,
  }
}

export function getAttestationvaultizabilityAdminGuidance(input: {
  stats: AttestationvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect attestationvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial attestationvaultizability coverage and refresh the attestationvaultizability summary.'
  }

  if (input.stats.attestationvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification attestationvaultizability below the 95% target and refresh the attestationvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace attestationvaultizability coverage and refresh the attestationvaultizability summary.'
}

export function resolveAttestationvaultizabilityAdminActions(): AttestationvaultizabilityAdminAction[] {
  return ['refresh_attestationvaultizability_summary']
}
