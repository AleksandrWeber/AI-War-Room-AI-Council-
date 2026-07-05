import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const observabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ObservabilizabilityRolloutCheckStatus = z.infer<
  typeof observabilizabilityRolloutCheckStatusSchema
>

export const observabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: observabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ObservabilizabilityRolloutCheck = z.infer<typeof observabilizabilityRolloutCheckSchema>

export const observabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ObservabilizabilityRolloutStatus = z.infer<typeof observabilizabilityRolloutStatusSchema>

export const observabilizabilityCapabilitiesResponseSchema = z.object({
  supportsObservabilizabilityRollout: z.literal(true),
  supportsObservabilizabilityAdminTools: z.literal(true),
  supportsBillingNotificationObservabilizabilitySignals: z.literal(true),
  supportsBillingWebhookObservabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ObservabilizabilityCapabilitiesResponse = z.infer<
  typeof observabilizabilityCapabilitiesResponseSchema
>

export const observabilizabilityRolloutResponseSchema = z.object({
  status: observabilizabilityRolloutStatusSchema,
  checks: z.array(observabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ObservabilizabilityRolloutResponse = z.infer<
  typeof observabilizabilityRolloutResponseSchema
>

export function getObservabilizabilityRolloutGuidance() {
  return 'Production observabilizability rollout validates billing notification observabilizability, billing webhook observabilizability signals, usage event coverage, and observabilization readiness before production observabilizability tooling.'
}
