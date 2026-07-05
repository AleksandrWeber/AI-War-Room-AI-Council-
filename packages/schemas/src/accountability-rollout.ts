import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const accountabilityRolloutCheckStatusSchema = z.enum([
  'pass',
  'fail',
  'skip',
])
export type AccountabilityRolloutCheckStatus = z.infer<
  typeof accountabilityRolloutCheckStatusSchema
>

export const accountabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: accountabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AccountabilityRolloutCheck = z.infer<
  typeof accountabilityRolloutCheckSchema
>

export const accountabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AccountabilityRolloutStatus = z.infer<
  typeof accountabilityRolloutStatusSchema
>

export const accountabilityCapabilitiesResponseSchema = z.object({
  supportsAccountabilityRollout: z.literal(true),
  supportsAccountabilityAdminTools: z.literal(true),
  supportsIdempotencyAccountabilitySignals: z.literal(true),
  supportsBillingRecordAccountabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AccountabilityCapabilitiesResponse = z.infer<
  typeof accountabilityCapabilitiesResponseSchema
>

export const accountabilityRolloutResponseSchema = z.object({
  status: accountabilityRolloutStatusSchema,
  checks: z.array(accountabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AccountabilityRolloutResponse = z.infer<
  typeof accountabilityRolloutResponseSchema
>

export function getAccountabilityRolloutGuidance() {
  return 'Production accountability rollout validates idempotency accountability, billing record accountability signals, usage audit coverage, and audit readiness before production accountability tooling.'
}
