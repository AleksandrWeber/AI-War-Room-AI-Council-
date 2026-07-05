import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const consistencyRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConsistencyRolloutCheckStatus = z.infer<
  typeof consistencyRolloutCheckStatusSchema
>

export const consistencyRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: consistencyRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConsistencyRolloutCheck = z.infer<
  typeof consistencyRolloutCheckSchema
>

export const consistencyRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConsistencyRolloutStatus = z.infer<
  typeof consistencyRolloutStatusSchema
>

export const consistencyCapabilitiesResponseSchema = z.object({
  supportsConsistencyRollout: z.literal(true),
  supportsConsistencyAdminTools: z.literal(true),
  supportsRunWorkflowAlignmentSignals: z.literal(true),
  supportsIdempotencyConsistencySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConsistencyCapabilitiesResponse = z.infer<
  typeof consistencyCapabilitiesResponseSchema
>

export const consistencyRolloutResponseSchema = z.object({
  status: consistencyRolloutStatusSchema,
  checks: z.array(consistencyRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConsistencyRolloutResponse = z.infer<
  typeof consistencyRolloutResponseSchema
>

export function getConsistencyRolloutGuidance() {
  return 'Production consistency rollout validates run workflow alignment, idempotency consistency signals, run outcome coverage, and alignment readiness before production consistency tooling.'
}
