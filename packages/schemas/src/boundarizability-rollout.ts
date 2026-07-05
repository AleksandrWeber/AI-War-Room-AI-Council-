import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const boundarizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type BoundarizabilityRolloutCheckStatus = z.infer<
  typeof boundarizabilityRolloutCheckStatusSchema
>

export const boundarizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: boundarizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type BoundarizabilityRolloutCheck = z.infer<typeof boundarizabilityRolloutCheckSchema>

export const boundarizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type BoundarizabilityRolloutStatus = z.infer<typeof boundarizabilityRolloutStatusSchema>

export const boundarizabilityCapabilitiesResponseSchema = z.object({
  supportsBoundarizabilityRollout: z.literal(true),
  supportsBoundarizabilityAdminTools: z.literal(true),
  supportsBillingNotificationBoundarizabilitySignals: z.literal(true),
  supportsBillingWebhookBoundarizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type BoundarizabilityCapabilitiesResponse = z.infer<
  typeof boundarizabilityCapabilitiesResponseSchema
>

export const boundarizabilityRolloutResponseSchema = z.object({
  status: boundarizabilityRolloutStatusSchema,
  checks: z.array(boundarizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type BoundarizabilityRolloutResponse = z.infer<
  typeof boundarizabilityRolloutResponseSchema
>

export function getBoundarizabilityRolloutGuidance() {
  return 'Production boundarizability rollout validates billing notification boundarizability, billing webhook boundarizability signals, usage event coverage, and boundarization readiness before production boundarizability tooling.'
}
