import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const indexizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IndexizabilityRolloutCheckStatus = z.infer<
  typeof indexizabilityRolloutCheckStatusSchema
>

export const indexizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: indexizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IndexizabilityRolloutCheck = z.infer<typeof indexizabilityRolloutCheckSchema>

export const indexizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IndexizabilityRolloutStatus = z.infer<typeof indexizabilityRolloutStatusSchema>

export const indexizabilityCapabilitiesResponseSchema = z.object({
  supportsIndexizabilityRollout: z.literal(true),
  supportsIndexizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyIndexizabilitySignals: z.literal(true),
  supportsUsageEventIndexizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IndexizabilityCapabilitiesResponse = z.infer<
  typeof indexizabilityCapabilitiesResponseSchema
>

export const indexizabilityRolloutResponseSchema = z.object({
  status: indexizabilityRolloutStatusSchema,
  checks: z.array(indexizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IndexizabilityRolloutResponse = z.infer<
  typeof indexizabilityRolloutResponseSchema
>

export function getIndexizabilityRolloutGuidance() {
  return 'Production indexizability rollout validates idempotency key indexizability, usage event indexizability signals, billing webhook coverage, and indexization readiness before production indexizability tooling.'
}
