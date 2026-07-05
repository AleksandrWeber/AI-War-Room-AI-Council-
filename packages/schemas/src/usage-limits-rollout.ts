import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'
import { paidTierSchema } from './usage.js'

export const usageLimitsRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type UsageLimitsRolloutCheckStatus = z.infer<
  typeof usageLimitsRolloutCheckStatusSchema
>

export const usageLimitsRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: usageLimitsRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type UsageLimitsRolloutCheck = z.infer<
  typeof usageLimitsRolloutCheckSchema
>

export const usageLimitsRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type UsageLimitsRolloutStatus = z.infer<
  typeof usageLimitsRolloutStatusSchema
>

export const usageLimitsCapabilitiesResponseSchema = z.object({
  supportsUsageLimitsRollout: z.literal(true),
  supportsQuotaAdminTools: z.literal(true),
  supportsDailyCostQuotaEnforcement: z.literal(true),
  supportedPaidTiers: z.array(paidTierSchema),
  guidance: nonEmptyStringSchema,
})
export type UsageLimitsCapabilitiesResponse = z.infer<
  typeof usageLimitsCapabilitiesResponseSchema
>

export const usageLimitsRolloutResponseSchema = z.object({
  status: usageLimitsRolloutStatusSchema,
  checks: z.array(usageLimitsRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type UsageLimitsRolloutResponse = z.infer<
  typeof usageLimitsRolloutResponseSchema
>

export const criticalUsageLimitTiers = ['free', 'pro', 'business'] as const

export function getUsageLimitsRolloutGuidance() {
  return 'Usage limits rollout validates persisted workspace limits, daily quota enforcement, and tier configuration before production quota tooling.'
}
