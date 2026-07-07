import type {
  ScalingizabilityAdminAction,
  ScalingizabilityAdminRecord,
  ScalingizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceScalingizabilityDomainInventory = {
  domain: ScalingizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildScalingizabilityAdminRecords(
  inventory: WorkspaceScalingizabilityDomainInventory[],
): ScalingizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildScalingizabilityAdminStats(input: {
  records: ScalingizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ScalingizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const scalingizabilityPercent =
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
    scalingizabilityPercent,
  }
}

export function getScalingizabilityAdminGuidance(input: {
  stats: ScalingizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect scalingizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial scalingizability coverage and refresh the scalingizability summary.'
  }

  if (input.stats.scalingizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice scalingizability below the 95% target and refresh the scalingizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace scalingizability coverage and refresh the scalingizability summary.'
}

export function resolveScalingizabilityAdminActions(): ScalingizabilityAdminAction[] {
  return ['refresh_scalingizability_summary']
}
