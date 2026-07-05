import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const ackizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AckizabilityRolloutCheckStatus = z.infer<
  typeof ackizabilityRolloutCheckStatusSchema
>

export const ackizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: ackizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AckizabilityRolloutCheck = z.infer<typeof ackizabilityRolloutCheckSchema>

export const ackizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AckizabilityRolloutStatus = z.infer<typeof ackizabilityRolloutStatusSchema>

export const ackizabilityCapabilitiesResponseSchema = z.object({
  supportsAckizabilityRollout: z.literal(true),
  supportsAckizabilityAdminTools: z.literal(true),
  supportsBillingWebhookAckizabilitySignals: z.literal(true),
  supportsBillingRecordAckizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AckizabilityCapabilitiesResponse = z.infer<
  typeof ackizabilityCapabilitiesResponseSchema
>

export const ackizabilityRolloutResponseSchema = z.object({
  status: ackizabilityRolloutStatusSchema,
  checks: z.array(ackizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AckizabilityRolloutResponse = z.infer<
  typeof ackizabilityRolloutResponseSchema
>

export function getAckizabilityRolloutGuidance() {
  return 'Production ackizability rollout validates billing webhook ackizability, billing record ackizability signals, usage event coverage, and interpolation readiness before production ackizability tooling.'
}
