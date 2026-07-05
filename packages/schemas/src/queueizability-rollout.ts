import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const queueizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type QueueizabilityRolloutCheckStatus = z.infer<
  typeof queueizabilityRolloutCheckStatusSchema
>

export const queueizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: queueizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type QueueizabilityRolloutCheck = z.infer<typeof queueizabilityRolloutCheckSchema>

export const queueizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type QueueizabilityRolloutStatus = z.infer<typeof queueizabilityRolloutStatusSchema>

export const queueizabilityCapabilitiesResponseSchema = z.object({
  supportsQueueizabilityRollout: z.literal(true),
  supportsQueueizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyQueueizabilitySignals: z.literal(true),
  supportsUsageEventQueueizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type QueueizabilityCapabilitiesResponse = z.infer<
  typeof queueizabilityCapabilitiesResponseSchema
>

export const queueizabilityRolloutResponseSchema = z.object({
  status: queueizabilityRolloutStatusSchema,
  checks: z.array(queueizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type QueueizabilityRolloutResponse = z.infer<
  typeof queueizabilityRolloutResponseSchema
>

export function getQueueizabilityRolloutGuidance() {
  return 'Production queueizability rollout validates idempotency key queueizability, usage event queueizability signals, billing webhook coverage, and queueization readiness before production queueizability tooling.'
}
