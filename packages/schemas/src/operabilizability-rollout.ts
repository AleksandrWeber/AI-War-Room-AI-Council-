import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const operabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type OperabilizabilityRolloutCheckStatus = z.infer<
  typeof operabilizabilityRolloutCheckStatusSchema
>

export const operabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: operabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type OperabilizabilityRolloutCheck = z.infer<typeof operabilizabilityRolloutCheckSchema>

export const operabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type OperabilizabilityRolloutStatus = z.infer<typeof operabilizabilityRolloutStatusSchema>

export const operabilizabilityCapabilitiesResponseSchema = z.object({
  supportsOperabilizabilityRollout: z.literal(true),
  supportsOperabilizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyOperabilizabilitySignals: z.literal(true),
  supportsUsageEventOperabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type OperabilizabilityCapabilitiesResponse = z.infer<
  typeof operabilizabilityCapabilitiesResponseSchema
>

export const operabilizabilityRolloutResponseSchema = z.object({
  status: operabilizabilityRolloutStatusSchema,
  checks: z.array(operabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type OperabilizabilityRolloutResponse = z.infer<
  typeof operabilizabilityRolloutResponseSchema
>

export function getOperabilizabilityRolloutGuidance() {
  return 'Production operabilizability rollout validates idempotency key operabilizability, usage event operabilizability signals, billing webhook coverage, and operabilization readiness before production operabilizability tooling.'
}
