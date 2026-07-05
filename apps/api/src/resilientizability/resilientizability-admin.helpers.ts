import type {
  ResilientizabilityAdminAction,
  ResilientizabilityAdminRecord,
  ResilientizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceResilientizabilityDomainInventory = {
  domain: ResilientizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildResilientizabilityAdminRecords(
  inventory: WorkspaceResilientizabilityDomainInventory[],
): ResilientizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildResilientizabilityAdminStats(input: {
  records: ResilientizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ResilientizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const resilientizabilityPercent =
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
    resilientizabilityPercent,
  }
}

export function getResilientizabilityAdminGuidance(input: {
  stats: ResilientizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect resilientizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial resilientizability coverage and refresh the resilientizability summary.'
  }

  if (input.stats.resilientizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership resilientizability below the 95% target and refresh the resilientizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace resilientizability coverage and refresh the resilientizability summary.'
}

export function resolveResilientizabilityAdminActions(): ResilientizabilityAdminAction[] {
  return ['refresh_resilientizability_summary']
}
