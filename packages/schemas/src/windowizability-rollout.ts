import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const windowizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type WindowizabilityRolloutCheckStatus = z.infer<
  typeof windowizabilityRolloutCheckStatusSchema
>

export const windowizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: windowizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type WindowizabilityRolloutCheck = z.infer<typeof windowizabilityRolloutCheckSchema>

export const windowizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type WindowizabilityRolloutStatus = z.infer<typeof windowizabilityRolloutStatusSchema>

export const windowizabilityCapabilitiesResponseSchema = z.object({
  supportsWindowizabilityRollout: z.literal(true),
  supportsWindowizabilityAdminTools: z.literal(true),
  supportsBillingNotificationWindowizabilitySignals: z.literal(true),
  supportsBillingWebhookWindowizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type WindowizabilityCapabilitiesResponse = z.infer<
  typeof windowizabilityCapabilitiesResponseSchema
>

export const windowizabilityRolloutResponseSchema = z.object({
  status: windowizabilityRolloutStatusSchema,
  checks: z.array(windowizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type WindowizabilityRolloutResponse = z.infer<
  typeof windowizabilityRolloutResponseSchema
>

export function getWindowizabilityRolloutGuidance() {
  return 'Production windowizability rollout validates billing notification windowizability, billing webhook windowizability signals, usage event coverage, and windowization readiness before production windowizability tooling.'
}
