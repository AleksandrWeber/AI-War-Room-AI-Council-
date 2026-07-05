import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const ordinarizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type OrdinarizabilityRolloutCheckStatus = z.infer<
  typeof ordinarizabilityRolloutCheckStatusSchema
>

export const ordinarizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: ordinarizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type OrdinarizabilityRolloutCheck = z.infer<typeof ordinarizabilityRolloutCheckSchema>

export const ordinarizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type OrdinarizabilityRolloutStatus = z.infer<typeof ordinarizabilityRolloutStatusSchema>

export const ordinarizabilityCapabilitiesResponseSchema = z.object({
  supportsOrdinarizabilityRollout: z.literal(true),
  supportsOrdinarizabilityAdminTools: z.literal(true),
  supportsBillingNotificationOrdinarizabilitySignals: z.literal(true),
  supportsBillingWebhookOrdinarizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type OrdinarizabilityCapabilitiesResponse = z.infer<
  typeof ordinarizabilityCapabilitiesResponseSchema
>

export const ordinarizabilityRolloutResponseSchema = z.object({
  status: ordinarizabilityRolloutStatusSchema,
  checks: z.array(ordinarizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type OrdinarizabilityRolloutResponse = z.infer<
  typeof ordinarizabilityRolloutResponseSchema
>

export function getOrdinarizabilityRolloutGuidance() {
  return 'Production ordinarizability rollout validates billing notification ordinarizability, billing webhook ordinarizability signals, usage event coverage, and ordinarization readiness before production ordinarizability tooling.'
}
