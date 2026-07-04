import type {
  BillingWorkspaceUsageResponse,
  UsageAdminAction,
  UsageAdminStats,
  WorkspaceRole,
} from '@ai-war-room/schemas'

export function buildUsageAdminStats(input: {
  usage: BillingWorkspaceUsageResponse
  dailyEventCount: number
  distinctRunCount: number
}): UsageAdminStats {
  const totalTokens = input.usage.dailyUsage.totalTokens

  return {
    dailyEventCount: input.dailyEventCount,
    distinctRunCount: input.distinctRunCount,
    tokenUtilizationPercent:
      input.usage.dailyTokenLimit > 0
        ? Math.round((totalTokens / input.usage.dailyTokenLimit) * 100)
        : 0,
    costUtilizationPercent:
      input.usage.dailyCostLimitUsd > 0
        ? Math.round(
            (input.usage.dailyUsage.estimatedCostUsd /
              input.usage.dailyCostLimitUsd) *
              100,
          )
        : 0,
  }
}

export function resolveUsageAdminActions(input: {
  nodeEnv: 'development' | 'test' | 'production'
  dailyEventCount: number
}): UsageAdminAction[] {
  if (input.nodeEnv === 'production' || input.dailyEventCount === 0) {
    return []
  }

  return ['reset_daily_usage']
}

export function getUsageAdminGuidance(input: {
  role: WorkspaceRole
  availableActions: UsageAdminAction[]
}) {
  if (input.availableActions.includes('reset_daily_usage')) {
    return 'Workspace owners and admins can inspect daily usage metrics and reset local daily usage counters for testing.'
  }

  return 'Workspace owners and admins can inspect daily usage metrics and quota utilization.'
}
