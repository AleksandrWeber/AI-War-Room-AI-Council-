import {
  criticalUsageLimitTiers,
  PAID_TIER_LIMITS,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'

export type UsageLimitsRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type UsageLimitsRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: UsageLimitsRolloutCheck[]
  guidance: string
}

export type UsageLimitsRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  usesInMemoryRepository: boolean
  supportsDailyCostQuotaEnforcement: boolean
  supportsDailyTokenLimitTracking: boolean
  supportedPaidTiers: readonly string[]
}

export function evaluateUsageLimitsRollout(
  input: UsageLimitsRolloutInput,
): UsageLimitsRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const missingTiers = criticalUsageLimitTiers.filter(
    (tier) => !input.supportedPaidTiers.includes(tier),
  )
  const invalidTierLimits = criticalUsageLimitTiers.filter((tier) => {
    const limits = PAID_TIER_LIMITS[tier]

    return limits.dailyTokenLimit <= 0 || limits.dailyCostLimitUsd <= 0
  })

  const checks: UsageLimitsRolloutCheck[] = [
    {
      name: 'persisted_usage_limits',
      label: 'Persisted usage limits',
      status: !input.usesInMemoryRepository || !isProduction ? 'pass' : 'fail',
      detail:
        !input.usesInMemoryRepository || !isProduction
          ? 'Workspace usage limits are persisted outside tests.'
          : 'Production usage limits rollout cannot rely on in-memory persistence.',
    },
    {
      name: 'daily_cost_quota_enforcement',
      label: 'Daily cost quota enforcement',
      status: input.supportsDailyCostQuotaEnforcement ? 'pass' : 'fail',
      detail: input.supportsDailyCostQuotaEnforcement
        ? 'Pipeline execution checks daily cost quotas before expensive work.'
        : 'Daily cost quota enforcement is not configured.',
    },
    {
      name: 'daily_token_limit_tracking',
      label: 'Daily token limit tracking',
      status: input.supportsDailyTokenLimitTracking ? 'pass' : 'fail',
      detail: input.supportsDailyTokenLimitTracking
        ? 'Usage events record token consumption for quota reporting.'
        : 'Daily token limit tracking is not configured.',
    },
    {
      name: 'tier_limit_configuration',
      label: 'Tier limit configuration',
      status: missingTiers.length === 0 ? 'pass' : 'fail',
      detail:
        missingTiers.length === 0
          ? `Usage limits are configured for ${criticalUsageLimitTiers.length} paid tiers.`
          : `Missing tier limits: ${missingTiers.join(', ')}.`,
    },
    {
      name: 'production_quota_limits',
      label: 'Production quota limits',
      status:
        !isProduction || invalidTierLimits.length === 0 ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Production quota limits are only enforced in production.'
          : invalidTierLimits.length === 0
            ? 'All production tier limits have positive token and cost quotas.'
            : `Invalid tier limits: ${invalidTierLimits.join(', ')}.`,
    },
  ]

  const status = checks.every((check) => check.status === 'pass')
    ? 'ready'
    : 'not_ready'

  return {
    status,
    checks,
    guidance:
      status === 'ready'
        ? 'Usage limits rollout checks passed. Workspace quota enforcement is ready for production.'
        : 'Usage limits rollout is not ready. Resolve failed checks before relying on production quota tooling.',
  }
}
