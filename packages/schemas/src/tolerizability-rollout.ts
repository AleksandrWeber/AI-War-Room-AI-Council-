import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const tolerizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TolerizabilityRolloutCheckStatus = z.infer<
  typeof tolerizabilityRolloutCheckStatusSchema
>

export const tolerizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: tolerizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TolerizabilityRolloutCheck = z.infer<typeof tolerizabilityRolloutCheckSchema>

export const tolerizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TolerizabilityRolloutStatus = z.infer<typeof tolerizabilityRolloutStatusSchema>

export const tolerizabilityCapabilitiesResponseSchema = z.object({
  supportsTolerizabilityRollout: z.literal(true),
  supportsTolerizabilityAdminTools: z.literal(true),
  supportsBillingNotificationTolerizabilitySignals: z.literal(true),
  supportsBillingWebhookTolerizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TolerizabilityCapabilitiesResponse = z.infer<
  typeof tolerizabilityCapabilitiesResponseSchema
>

export const tolerizabilityRolloutResponseSchema = z.object({
  status: tolerizabilityRolloutStatusSchema,
  checks: z.array(tolerizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TolerizabilityRolloutResponse = z.infer<
  typeof tolerizabilityRolloutResponseSchema
>

export function getTolerizabilityRolloutGuidance() {
  return 'Production tolerizability rollout validates billing notification tolerizability, billing webhook tolerizability signals, usage event coverage, and tolerization readiness before production tolerizability tooling.'
}
