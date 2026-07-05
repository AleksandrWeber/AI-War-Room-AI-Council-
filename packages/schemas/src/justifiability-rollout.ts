import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const justifiabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type JustifiabilityRolloutCheckStatus = z.infer<
  typeof justifiabilityRolloutCheckStatusSchema
>

export const justifiabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: justifiabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type JustifiabilityRolloutCheck = z.infer<typeof justifiabilityRolloutCheckSchema>

export const justifiabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type JustifiabilityRolloutStatus = z.infer<typeof justifiabilityRolloutStatusSchema>

export const justifiabilityCapabilitiesResponseSchema = z.object({
  supportsJustifiabilityRollout: z.literal(true),
  supportsJustifiabilityAdminTools: z.literal(true),
  supportsShieldReviewJustifiabilitySignals: z.literal(true),
  supportsBillingWebhookJustifiabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type JustifiabilityCapabilitiesResponse = z.infer<
  typeof justifiabilityCapabilitiesResponseSchema
>

export const justifiabilityRolloutResponseSchema = z.object({
  status: justifiabilityRolloutStatusSchema,
  checks: z.array(justifiabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type JustifiabilityRolloutResponse = z.infer<
  typeof justifiabilityRolloutResponseSchema
>

export function getJustifiabilityRolloutGuidance() {
  return 'Production justifiability rollout validates shield review justifiability, billing webhook justifiability signals, idempotency coverage, and rationale readiness before production justifiability tooling.'
}
