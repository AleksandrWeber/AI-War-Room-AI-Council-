import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const operabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type OperabilityRolloutCheckStatus = z.infer<
  typeof operabilityRolloutCheckStatusSchema
>

export const operabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: operabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type OperabilityRolloutCheck = z.infer<typeof operabilityRolloutCheckSchema>

export const operabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type OperabilityRolloutStatus = z.infer<typeof operabilityRolloutStatusSchema>

export const operabilityCapabilitiesResponseSchema = z.object({
  supportsOperabilityRollout: z.literal(true),
  supportsOperabilityAdminTools: z.literal(true),
  supportsBillingNotificationOperabilitySignals: z.literal(true),
  supportsBillingWebhookOperabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type OperabilityCapabilitiesResponse = z.infer<
  typeof operabilityCapabilitiesResponseSchema
>

export const operabilityRolloutResponseSchema = z.object({
  status: operabilityRolloutStatusSchema,
  checks: z.array(operabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type OperabilityRolloutResponse = z.infer<
  typeof operabilityRolloutResponseSchema
>

export function getOperabilityRolloutGuidance() {
  return 'Production operability rollout validates billing notification operability, billing webhook operability signals, billing record coverage, and operation readiness before production operability tooling.'
}
