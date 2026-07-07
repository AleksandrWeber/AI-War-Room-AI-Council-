import type {
  AutomatabilityvaultizabilityAdminAction,
  AutomatabilityvaultizabilityAdminRecord,
  AutomatabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAutomatabilityvaultizabilityDomainInventory = {
  domain: AutomatabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAutomatabilityvaultizabilityAdminRecords(
  inventory: WorkspaceAutomatabilityvaultizabilityDomainInventory[],
): AutomatabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAutomatabilityvaultizabilityAdminStats(input: {
  records: AutomatabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AutomatabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const automatabilityvaultizabilityPercent =
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
    automatabilityvaultizabilityPercent,
  }
}

export function getAutomatabilityvaultizabilityAdminGuidance(input: {
  stats: AutomatabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect automatabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial automatabilityvaultizability coverage and refresh the automatabilityvaultizability summary.'
  }

  if (input.stats.automatabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key automatabilityvaultizability below the 95% target and refresh the automatabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace automatabilityvaultizability coverage and refresh the automatabilityvaultizability summary.'
}

export function resolveAutomatabilityvaultizabilityAdminActions(): AutomatabilityvaultizabilityAdminAction[] {
  return ['refresh_automatabilityvaultizability_summary']
}
