import type {
  SandboxizabilityAdminAction,
  SandboxizabilityAdminRecord,
  SandboxizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSandboxizabilityDomainInventory = {
  domain: SandboxizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSandboxizabilityAdminRecords(
  inventory: WorkspaceSandboxizabilityDomainInventory[],
): SandboxizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSandboxizabilityAdminStats(input: {
  records: SandboxizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SandboxizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const sandboxizabilityPercent =
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
    sandboxizabilityPercent,
  }
}

export function getSandboxizabilityAdminGuidance(input: {
  stats: SandboxizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect sandboxizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial sandboxizability coverage and refresh the sandboxizability summary.'
  }

  if (input.stats.sandboxizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership sandboxizability below the 95% target and refresh the sandboxizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace sandboxizability coverage and refresh the sandboxizability summary.'
}

export function resolveSandboxizabilityAdminActions(): SandboxizabilityAdminAction[] {
  return ['refresh_sandboxizability_summary']
}
