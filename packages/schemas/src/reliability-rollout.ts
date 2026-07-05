import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const reliabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ReliabilityRolloutCheckStatus = z.infer<
  typeof reliabilityRolloutCheckStatusSchema
>

export const reliabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: reliabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ReliabilityRolloutCheck = z.infer<typeof reliabilityRolloutCheckSchema>

export const reliabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ReliabilityRolloutStatus = z.infer<
  typeof reliabilityRolloutStatusSchema
>

export const reliabilityCapabilitiesResponseSchema = z.object({
  supportsReliabilityRollout: z.literal(true),
  supportsReliabilityAdminTools: z.literal(true),
  supportsModelHealthReliabilitySignals: z.literal(true),
  supportsIdempotencyFaultTolerance: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ReliabilityCapabilitiesResponse = z.infer<
  typeof reliabilityCapabilitiesResponseSchema
>

export const reliabilityRolloutResponseSchema = z.object({
  status: reliabilityRolloutStatusSchema,
  checks: z.array(reliabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ReliabilityRolloutResponse = z.infer<
  typeof reliabilityRolloutResponseSchema
>

export function getReliabilityRolloutGuidance() {
  return 'Production reliability rollout validates run outcome signals, model health events, idempotency fault tolerance, and fault tolerance readiness before production reliability tooling.'
}
