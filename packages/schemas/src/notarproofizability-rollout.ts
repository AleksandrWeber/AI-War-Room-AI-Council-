import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const notarproofizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NotarproofizabilityRolloutCheckStatus = z.infer<
  typeof notarproofizabilityRolloutCheckStatusSchema
>

export const notarproofizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: notarproofizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NotarproofizabilityRolloutCheck = z.infer<typeof notarproofizabilityRolloutCheckSchema>

export const notarproofizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NotarproofizabilityRolloutStatus = z.infer<typeof notarproofizabilityRolloutStatusSchema>

export const notarproofizabilityCapabilitiesResponseSchema = z.object({
  supportsNotarproofizabilityRollout: z.literal(true),
  supportsNotarproofizabilityAdminTools: z.literal(true),
  supportsBillingNotificationNotarproofizabilitySignals: z.literal(true),
  supportsBillingWebhookNotarproofizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NotarproofizabilityCapabilitiesResponse = z.infer<
  typeof notarproofizabilityCapabilitiesResponseSchema
>

export const notarproofizabilityRolloutResponseSchema = z.object({
  status: notarproofizabilityRolloutStatusSchema,
  checks: z.array(notarproofizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NotarproofizabilityRolloutResponse = z.infer<
  typeof notarproofizabilityRolloutResponseSchema
>

export function getNotarproofizabilityRolloutGuidance() {
  return 'Production notarproofizability rollout validates billing notification notarproofizability, billing webhook notarproofizability signals, usage event coverage, and governanceization readiness before production notarproofizability tooling.'
}
