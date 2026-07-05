import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const timeoutizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TimeoutizabilityRolloutCheckStatus = z.infer<
  typeof timeoutizabilityRolloutCheckStatusSchema
>

export const timeoutizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: timeoutizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TimeoutizabilityRolloutCheck = z.infer<typeof timeoutizabilityRolloutCheckSchema>

export const timeoutizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TimeoutizabilityRolloutStatus = z.infer<typeof timeoutizabilityRolloutStatusSchema>

export const timeoutizabilityCapabilitiesResponseSchema = z.object({
  supportsTimeoutizabilityRollout: z.literal(true),
  supportsTimeoutizabilityAdminTools: z.literal(true),
  supportsBillingNotificationTimeoutizabilitySignals: z.literal(true),
  supportsBillingWebhookTimeoutizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TimeoutizabilityCapabilitiesResponse = z.infer<
  typeof timeoutizabilityCapabilitiesResponseSchema
>

export const timeoutizabilityRolloutResponseSchema = z.object({
  status: timeoutizabilityRolloutStatusSchema,
  checks: z.array(timeoutizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TimeoutizabilityRolloutResponse = z.infer<
  typeof timeoutizabilityRolloutResponseSchema
>

export function getTimeoutizabilityRolloutGuidance() {
  return 'Production timeoutizability rollout validates billing notification timeoutizability, billing webhook timeoutizability signals, usage event coverage, and timeoutization readiness before production timeoutizability tooling.'
}
