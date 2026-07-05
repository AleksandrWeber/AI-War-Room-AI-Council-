import type {
  BillingWorkspaceUsageResponse,
  QuotaAdminAction,
  QuotaAdminRecord,
  QuotaAdminStats,
  UsageEvent,
} from '@ai-war-room/schemas'

export function toQuotaAdminRecord(event: UsageEvent): QuotaAdminRecord {
  return {
    usageEventId: event.usageEventId,
    runId: event.runId,
    phase: event.phase,
    totalTokens: event.inputTokens + event.outputTokens,
    estimatedCostUsd: event.estimatedCostUsd,
    createdAt: event.createdAt,
  }
}

export function buildQuotaAdminStats(input: {
  usage: BillingWorkspaceUsageResponse
  dailyEventCount: number
  distinctRunCount: number
}): QuotaAdminStats {
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
    quotaExceeded:
      totalTokens > input.usage.dailyTokenLimit ||
      input.usage.dailyUsage.estimatedCostUsd > input.usage.dailyCostLimitUsd,
  }
}

export function getQuotaAdminGuidance(input: { stats: QuotaAdminStats }) {
  if (input.stats.quotaExceeded) {
    return 'Workspace owners and admins can inspect quota utilization and recent usage events after daily limits were exceeded.'
  }

  if (input.stats.dailyEventCount === 0) {
    return 'Workspace owners and admins can inspect quota metrics once usage events are recorded.'
  }

  return 'Workspace owners and admins can inspect daily quota utilization and recent usage events.'
}

export function resolveQuotaAdminActions(): QuotaAdminAction[] {
  return ['refresh_quota_summary']
}
