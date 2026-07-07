import type {
  CertifiabilityvaultizabilityAdminAction,
  CertifiabilityvaultizabilityAdminRecord,
  CertifiabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCertifiabilityvaultizabilityDomainInventory = {
  domain: CertifiabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCertifiabilityvaultizabilityAdminRecords(
  inventory: WorkspaceCertifiabilityvaultizabilityDomainInventory[],
): CertifiabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCertifiabilityvaultizabilityAdminStats(input: {
  records: CertifiabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CertifiabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const certifiabilityvaultizabilityPercent =
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
    certifiabilityvaultizabilityPercent,
  }
}

export function getCertifiabilityvaultizabilityAdminGuidance(input: {
  stats: CertifiabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect certifiabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial certifiabilityvaultizability coverage and refresh the certifiabilityvaultizability summary.'
  }

  if (input.stats.certifiabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key certifiabilityvaultizability below the 95% target and refresh the certifiabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace certifiabilityvaultizability coverage and refresh the certifiabilityvaultizability summary.'
}

export function resolveCertifiabilityvaultizabilityAdminActions(): CertifiabilityvaultizabilityAdminAction[] {
  return ['refresh_certifiabilityvaultizability_summary']
}
