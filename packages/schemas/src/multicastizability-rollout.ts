import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const multicastizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MulticastizabilityRolloutCheckStatus = z.infer<
  typeof multicastizabilityRolloutCheckStatusSchema
>

export const multicastizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: multicastizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MulticastizabilityRolloutCheck = z.infer<typeof multicastizabilityRolloutCheckSchema>

export const multicastizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MulticastizabilityRolloutStatus = z.infer<typeof multicastizabilityRolloutStatusSchema>

export const multicastizabilityCapabilitiesResponseSchema = z.object({
  supportsMulticastizabilityRollout: z.literal(true),
  supportsMulticastizabilityAdminTools: z.literal(true),
  supportsBillingNotificationMulticastizabilitySignals: z.literal(true),
  supportsBillingWebhookMulticastizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MulticastizabilityCapabilitiesResponse = z.infer<
  typeof multicastizabilityCapabilitiesResponseSchema
>

export const multicastizabilityRolloutResponseSchema = z.object({
  status: multicastizabilityRolloutStatusSchema,
  checks: z.array(multicastizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MulticastizabilityRolloutResponse = z.infer<
  typeof multicastizabilityRolloutResponseSchema
>

export function getMulticastizabilityRolloutGuidance() {
  return 'Production multicastizability rollout validates billing notification multicastizability, billing webhook multicastizability signals, usage event coverage, and multicastization readiness before production multicastizability tooling.'
}
