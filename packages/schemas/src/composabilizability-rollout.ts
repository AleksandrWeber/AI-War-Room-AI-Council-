import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const composabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ComposabilizabilityRolloutCheckStatus = z.infer<
  typeof composabilizabilityRolloutCheckStatusSchema
>

export const composabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: composabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ComposabilizabilityRolloutCheck = z.infer<typeof composabilizabilityRolloutCheckSchema>

export const composabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ComposabilizabilityRolloutStatus = z.infer<typeof composabilizabilityRolloutStatusSchema>

export const composabilizabilityCapabilitiesResponseSchema = z.object({
  supportsComposabilizabilityRollout: z.literal(true),
  supportsComposabilizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyComposabilizabilitySignals: z.literal(true),
  supportsUsageEventComposabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ComposabilizabilityCapabilitiesResponse = z.infer<
  typeof composabilizabilityCapabilitiesResponseSchema
>

export const composabilizabilityRolloutResponseSchema = z.object({
  status: composabilizabilityRolloutStatusSchema,
  checks: z.array(composabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ComposabilizabilityRolloutResponse = z.infer<
  typeof composabilizabilityRolloutResponseSchema
>

export function getComposabilizabilityRolloutGuidance() {
  return 'Production composabilizability rollout validates idempotency key composabilizability, usage event composabilizability signals, billing webhook coverage, and composabilization readiness before production composabilizability tooling.'
}
