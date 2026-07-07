import type {
  CertificationizabilityAdminAction,
  CertificationizabilityAdminRecord,
  CertificationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCertificationizabilityDomainInventory = {
  domain: CertificationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCertificationizabilityAdminRecords(
  inventory: WorkspaceCertificationizabilityDomainInventory[],
): CertificationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCertificationizabilityAdminStats(input: {
  records: CertificationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CertificationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const certificationizabilityPercent =
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
    certificationizabilityPercent,
  }
}

export function getCertificationizabilityAdminGuidance(input: {
  stats: CertificationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect certificationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial certificationizability coverage and refresh the certificationizability summary.'
  }

  if (input.stats.certificationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice certificationizability below the 95% target and refresh the certificationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace certificationizability coverage and refresh the certificationizability summary.'
}

export function resolveCertificationizabilityAdminActions(): CertificationizabilityAdminAction[] {
  return ['refresh_certificationizability_summary']
}
