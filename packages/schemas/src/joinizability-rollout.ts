import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const joinizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type JoinizabilityRolloutCheckStatus = z.infer<
  typeof joinizabilityRolloutCheckStatusSchema
>

export const joinizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: joinizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type JoinizabilityRolloutCheck = z.infer<typeof joinizabilityRolloutCheckSchema>

export const joinizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type JoinizabilityRolloutStatus = z.infer<typeof joinizabilityRolloutStatusSchema>

export const joinizabilityCapabilitiesResponseSchema = z.object({
  supportsJoinizabilityRollout: z.literal(true),
  supportsJoinizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyJoinizabilitySignals: z.literal(true),
  supportsUsageEventJoinizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type JoinizabilityCapabilitiesResponse = z.infer<
  typeof joinizabilityCapabilitiesResponseSchema
>

export const joinizabilityRolloutResponseSchema = z.object({
  status: joinizabilityRolloutStatusSchema,
  checks: z.array(joinizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type JoinizabilityRolloutResponse = z.infer<
  typeof joinizabilityRolloutResponseSchema
>

export function getJoinizabilityRolloutGuidance() {
  return 'Production joinizability rollout validates idempotency key joinizability, usage event joinizability signals, billing webhook coverage, and joinization readiness before production joinizability tooling.'
}
