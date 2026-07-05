import type {
  CertifiabilityAdminAction,
  CertifiabilityAdminRecord,
  CertifiabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCertifiabilityDomainInventory = {
  domain: CertifiabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCertifiabilityAdminRecords(
  inventory: WorkspaceCertifiabilityDomainInventory[],
): CertifiabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCertifiabilityAdminStats(input: {
  records: CertifiabilityAdminRecord[]
  postgresConnectivity: boolean
}): CertifiabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const certifiabilityPercent =
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
    certifiabilityPercent,
  }
}

export function getCertifiabilityAdminGuidance(input: {
  stats: CertifiabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect certifiability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial certifiability coverage and refresh the certifiability summary.'
  }

  if (input.stats.certifiabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential certifiability below the 95% target and refresh the certifiability summary.'
  }

  return 'Workspace owners and admins can inspect workspace certifiability coverage and refresh the certifiability summary.'
}

export function resolveCertifiabilityAdminActions(): CertifiabilityAdminAction[] {
  return ['refresh_certifiability_summary']
}
