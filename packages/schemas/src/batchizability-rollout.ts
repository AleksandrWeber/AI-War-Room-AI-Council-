import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const batchizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type BatchizabilityRolloutCheckStatus = z.infer<
  typeof batchizabilityRolloutCheckStatusSchema
>

export const batchizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: batchizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type BatchizabilityRolloutCheck = z.infer<typeof batchizabilityRolloutCheckSchema>

export const batchizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type BatchizabilityRolloutStatus = z.infer<typeof batchizabilityRolloutStatusSchema>

export const batchizabilityCapabilitiesResponseSchema = z.object({
  supportsBatchizabilityRollout: z.literal(true),
  supportsBatchizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyBatchizabilitySignals: z.literal(true),
  supportsUsageEventBatchizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type BatchizabilityCapabilitiesResponse = z.infer<
  typeof batchizabilityCapabilitiesResponseSchema
>

export const batchizabilityRolloutResponseSchema = z.object({
  status: batchizabilityRolloutStatusSchema,
  checks: z.array(batchizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type BatchizabilityRolloutResponse = z.infer<
  typeof batchizabilityRolloutResponseSchema
>

export function getBatchizabilityRolloutGuidance() {
  return 'Production batchizability rollout validates idempotency key batchizability, usage event batchizability signals, billing webhook coverage, and batchization readiness before production batchizability tooling.'
}
