import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const signifiabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SignifiabilityRolloutCheckStatus = z.infer<
  typeof signifiabilityRolloutCheckStatusSchema
>

export const signifiabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: signifiabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SignifiabilityRolloutCheck = z.infer<typeof signifiabilityRolloutCheckSchema>

export const signifiabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SignifiabilityRolloutStatus = z.infer<typeof signifiabilityRolloutStatusSchema>

export const signifiabilityCapabilitiesResponseSchema = z.object({
  supportsSignifiabilityRollout: z.literal(true),
  supportsSignifiabilityAdminTools: z.literal(true),
  supportsBillingWebhookSignifiabilitySignals: z.literal(true),
  supportsBillingRecordSignifiabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SignifiabilityCapabilitiesResponse = z.infer<
  typeof signifiabilityCapabilitiesResponseSchema
>

export const signifiabilityRolloutResponseSchema = z.object({
  status: signifiabilityRolloutStatusSchema,
  checks: z.array(signifiabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SignifiabilityRolloutResponse = z.infer<
  typeof signifiabilityRolloutResponseSchema
>

export function getSignifiabilityRolloutGuidance() {
  return 'Production signifiability rollout validates billing webhook signifiability, billing record signifiability signals, usage event coverage, and signification readiness before production signifiability tooling.'
}
