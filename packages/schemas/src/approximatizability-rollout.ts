import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const approximatizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ApproximatizabilityRolloutCheckStatus = z.infer<
  typeof approximatizabilityRolloutCheckStatusSchema
>

export const approximatizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: approximatizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ApproximatizabilityRolloutCheck = z.infer<typeof approximatizabilityRolloutCheckSchema>

export const approximatizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ApproximatizabilityRolloutStatus = z.infer<typeof approximatizabilityRolloutStatusSchema>

export const approximatizabilityCapabilitiesResponseSchema = z.object({
  supportsApproximatizabilityRollout: z.literal(true),
  supportsApproximatizabilityAdminTools: z.literal(true),
  supportsBillingWebhookApproximatizabilitySignals: z.literal(true),
  supportsBillingRecordApproximatizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ApproximatizabilityCapabilitiesResponse = z.infer<
  typeof approximatizabilityCapabilitiesResponseSchema
>

export const approximatizabilityRolloutResponseSchema = z.object({
  status: approximatizabilityRolloutStatusSchema,
  checks: z.array(approximatizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ApproximatizabilityRolloutResponse = z.infer<
  typeof approximatizabilityRolloutResponseSchema
>

export function getApproximatizabilityRolloutGuidance() {
  return 'Production approximatizability rollout validates billing webhook approximatizability, billing record approximatizability signals, usage event coverage, and interpolation readiness before production approximatizability tooling.'
}
