import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const automatizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AutomatizabilityRolloutCheckStatus = z.infer<
  typeof automatizabilityRolloutCheckStatusSchema
>

export const automatizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: automatizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AutomatizabilityRolloutCheck = z.infer<typeof automatizabilityRolloutCheckSchema>

export const automatizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AutomatizabilityRolloutStatus = z.infer<typeof automatizabilityRolloutStatusSchema>

export const automatizabilityCapabilitiesResponseSchema = z.object({
  supportsAutomatizabilityRollout: z.literal(true),
  supportsAutomatizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyAutomatizabilitySignals: z.literal(true),
  supportsUsageEventAutomatizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AutomatizabilityCapabilitiesResponse = z.infer<
  typeof automatizabilityCapabilitiesResponseSchema
>

export const automatizabilityRolloutResponseSchema = z.object({
  status: automatizabilityRolloutStatusSchema,
  checks: z.array(automatizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AutomatizabilityRolloutResponse = z.infer<
  typeof automatizabilityRolloutResponseSchema
>

export function getAutomatizabilityRolloutGuidance() {
  return 'Production automatizability rollout validates idempotency key automatizability, usage event automatizability signals, billing webhook coverage, and automatization readiness before production automatizability tooling.'
}
