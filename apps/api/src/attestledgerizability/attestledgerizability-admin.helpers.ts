import type {
  AttestledgerizabilityAdminAction,
  AttestledgerizabilityAdminRecord,
  AttestledgerizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAttestledgerizabilityDomainInventory = {
  domain: AttestledgerizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAttestledgerizabilityAdminRecords(
  inventory: WorkspaceAttestledgerizabilityDomainInventory[],
): AttestledgerizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAttestledgerizabilityAdminStats(input: {
  records: AttestledgerizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AttestledgerizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const attestledgerizabilityPercent =
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
    attestledgerizabilityPercent,
  }
}

export function getAttestledgerizabilityAdminGuidance(input: {
  stats: AttestledgerizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect attestledgerizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial attestledgerizability coverage and refresh the attestledgerizability summary.'
  }

  if (input.stats.attestledgerizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership attestledgerizability below the 95% target and refresh the attestledgerizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace attestledgerizability coverage and refresh the attestledgerizability summary.'
}

export function resolveAttestledgerizabilityAdminActions(): AttestledgerizabilityAdminAction[] {
  return ['refresh_attestledgerizability_summary']
}
