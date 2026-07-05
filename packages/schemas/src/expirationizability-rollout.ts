import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const expirationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ExpirationizabilityRolloutCheckStatus = z.infer<
  typeof expirationizabilityRolloutCheckStatusSchema
>

export const expirationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: expirationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ExpirationizabilityRolloutCheck = z.infer<typeof expirationizabilityRolloutCheckSchema>

export const expirationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ExpirationizabilityRolloutStatus = z.infer<typeof expirationizabilityRolloutStatusSchema>

export const expirationizabilityCapabilitiesResponseSchema = z.object({
  supportsExpirationizabilityRollout: z.literal(true),
  supportsExpirationizabilityAdminTools: z.literal(true),
  supportsBillingNotificationExpirationizabilitySignals: z.literal(true),
  supportsBillingWebhookExpirationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ExpirationizabilityCapabilitiesResponse = z.infer<
  typeof expirationizabilityCapabilitiesResponseSchema
>

export const expirationizabilityRolloutResponseSchema = z.object({
  status: expirationizabilityRolloutStatusSchema,
  checks: z.array(expirationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ExpirationizabilityRolloutResponse = z.infer<
  typeof expirationizabilityRolloutResponseSchema
>

export function getExpirationizabilityRolloutGuidance() {
  return 'Production expirationizability rollout validates billing notification expirationizability, billing webhook expirationizability signals, usage event coverage, and expirationization readiness before production expirationizability tooling.'
}
