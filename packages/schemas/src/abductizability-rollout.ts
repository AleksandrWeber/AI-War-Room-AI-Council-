import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const abductizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AbductizabilityRolloutCheckStatus = z.infer<
  typeof abductizabilityRolloutCheckStatusSchema
>

export const abductizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: abductizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AbductizabilityRolloutCheck = z.infer<typeof abductizabilityRolloutCheckSchema>

export const abductizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AbductizabilityRolloutStatus = z.infer<typeof abductizabilityRolloutStatusSchema>

export const abductizabilityCapabilitiesResponseSchema = z.object({
  supportsAbductizabilityRollout: z.literal(true),
  supportsAbductizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyAbductizabilitySignals: z.literal(true),
  supportsUsageEventAbductizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AbductizabilityCapabilitiesResponse = z.infer<
  typeof abductizabilityCapabilitiesResponseSchema
>

export const abductizabilityRolloutResponseSchema = z.object({
  status: abductizabilityRolloutStatusSchema,
  checks: z.array(abductizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AbductizabilityRolloutResponse = z.infer<
  typeof abductizabilityRolloutResponseSchema
>

export function getAbductizabilityRolloutGuidance() {
  return 'Production abductizability rollout validates idempotency key abductizability, usage event abductizability signals, billing webhook coverage, and abductization readiness before production abductizability tooling.'
}
