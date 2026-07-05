import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const batchingizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type BatchingizabilityRolloutCheckStatus = z.infer<
  typeof batchingizabilityRolloutCheckStatusSchema
>

export const batchingizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: batchingizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type BatchingizabilityRolloutCheck = z.infer<typeof batchingizabilityRolloutCheckSchema>

export const batchingizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type BatchingizabilityRolloutStatus = z.infer<typeof batchingizabilityRolloutStatusSchema>

export const batchingizabilityCapabilitiesResponseSchema = z.object({
  supportsBatchingizabilityRollout: z.literal(true),
  supportsBatchingizabilityAdminTools: z.literal(true),
  supportsMembershipBatchingizabilitySignals: z.literal(true),
  supportsUsageEventBatchingizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type BatchingizabilityCapabilitiesResponse = z.infer<
  typeof batchingizabilityCapabilitiesResponseSchema
>

export const batchingizabilityRolloutResponseSchema = z.object({
  status: batchingizabilityRolloutStatusSchema,
  checks: z.array(batchingizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type BatchingizabilityRolloutResponse = z.infer<
  typeof batchingizabilityRolloutResponseSchema
>

export function getBatchingizabilityRolloutGuidance() {
  return 'Production batchingizability rollout validates membership batchingizability, usage event batchingizability signals, billing notification coverage, and batchingization readiness before production batchingizability tooling.'
}
