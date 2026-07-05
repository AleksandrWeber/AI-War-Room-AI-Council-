import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const distinctivenessRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DistinctivenessRolloutCheckStatus = z.infer<
  typeof distinctivenessRolloutCheckStatusSchema
>

export const distinctivenessRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: distinctivenessRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DistinctivenessRolloutCheck = z.infer<typeof distinctivenessRolloutCheckSchema>

export const distinctivenessRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DistinctivenessRolloutStatus = z.infer<typeof distinctivenessRolloutStatusSchema>

export const distinctivenessCapabilitiesResponseSchema = z.object({
  supportsDistinctivenessRollout: z.literal(true),
  supportsDistinctivenessAdminTools: z.literal(true),
  supportsIdempotencyKeyDistinctivenessSignals: z.literal(true),
  supportsUsageEventDistinctivenessSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DistinctivenessCapabilitiesResponse = z.infer<
  typeof distinctivenessCapabilitiesResponseSchema
>

export const distinctivenessRolloutResponseSchema = z.object({
  status: distinctivenessRolloutStatusSchema,
  checks: z.array(distinctivenessRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DistinctivenessRolloutResponse = z.infer<
  typeof distinctivenessRolloutResponseSchema
>

export function getDistinctivenessRolloutGuidance() {
  return 'Production distinctiveness rollout validates idempotency key distinctiveness, usage event distinctiveness signals, billing webhook coverage, and distinction readiness before production distinctiveness tooling.'
}
