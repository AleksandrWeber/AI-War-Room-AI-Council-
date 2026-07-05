import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const interpolizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type InterpolizabilityRolloutCheckStatus = z.infer<
  typeof interpolizabilityRolloutCheckStatusSchema
>

export const interpolizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: interpolizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type InterpolizabilityRolloutCheck = z.infer<typeof interpolizabilityRolloutCheckSchema>

export const interpolizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type InterpolizabilityRolloutStatus = z.infer<typeof interpolizabilityRolloutStatusSchema>

export const interpolizabilityCapabilitiesResponseSchema = z.object({
  supportsInterpolizabilityRollout: z.literal(true),
  supportsInterpolizabilityAdminTools: z.literal(true),
  supportsBillingWebhookInterpolizabilitySignals: z.literal(true),
  supportsBillingRecordInterpolizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type InterpolizabilityCapabilitiesResponse = z.infer<
  typeof interpolizabilityCapabilitiesResponseSchema
>

export const interpolizabilityRolloutResponseSchema = z.object({
  status: interpolizabilityRolloutStatusSchema,
  checks: z.array(interpolizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type InterpolizabilityRolloutResponse = z.infer<
  typeof interpolizabilityRolloutResponseSchema
>

export function getInterpolizabilityRolloutGuidance() {
  return 'Production interpolizability rollout validates billing webhook interpolizability, billing record interpolizability signals, usage event coverage, and interpolation readiness before production interpolizability tooling.'
}
