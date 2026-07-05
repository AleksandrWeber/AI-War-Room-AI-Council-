import type {
  GovernanceAdminAction,
  GovernanceAdminRecord,
  GovernanceAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceGovernanceDomainInventory = {
  domain: GovernanceAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildGovernanceAdminRecords(
  inventory: WorkspaceGovernanceDomainInventory[],
): GovernanceAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildGovernanceAdminStats(input: {
  records: GovernanceAdminRecord[]
  postgresConnectivity: boolean
}): GovernanceAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const memberships =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const providerCredentials =
    input.records.find((record) => record.domain === 'provider_credentials')
      ?.recordCount ?? 0
  const governancePercent =
    memberships === 0
      ? coveredDomains === input.records.length
        ? 100
        : Math.round((coveredDomains / input.records.length) * 100)
      : Math.min(100, Math.round((providerCredentials / memberships) * 100))

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    governancePercent,
  }
}

export function getGovernanceAdminGuidance(input: {
  stats: GovernanceAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect governance metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial governance coverage and refresh the governance summary.'
  }

  if (input.stats.governancePercent < 95) {
    return 'Workspace owners and admins can inspect credential governance below the 95% target and refresh the governance summary.'
  }

  return 'Workspace owners and admins can inspect workspace governance coverage and refresh the governance summary.'
}

export function resolveGovernanceAdminActions(): GovernanceAdminAction[] {
  return ['refresh_governance_summary']
}
