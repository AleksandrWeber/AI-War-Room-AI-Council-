import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const deducizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DeducizabilityRolloutCheckStatus = z.infer<
  typeof deducizabilityRolloutCheckStatusSchema
>

export const deducizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: deducizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DeducizabilityRolloutCheck = z.infer<typeof deducizabilityRolloutCheckSchema>

export const deducizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DeducizabilityRolloutStatus = z.infer<typeof deducizabilityRolloutStatusSchema>

export const deducizabilityCapabilitiesResponseSchema = z.object({
  supportsDeducizabilityRollout: z.literal(true),
  supportsDeducizabilityAdminTools: z.literal(true),
  supportsBillingNotificationDeducizabilitySignals: z.literal(true),
  supportsBillingWebhookDeducizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DeducizabilityCapabilitiesResponse = z.infer<
  typeof deducizabilityCapabilitiesResponseSchema
>

export const deducizabilityRolloutResponseSchema = z.object({
  status: deducizabilityRolloutStatusSchema,
  checks: z.array(deducizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DeducizabilityRolloutResponse = z.infer<
  typeof deducizabilityRolloutResponseSchema
>

export function getDeducizabilityRolloutGuidance() {
  return 'Production deducizability rollout validates billing notification deducizability, billing webhook deducizability signals, usage event coverage, and deducization readiness before production deducizability tooling.'
}
