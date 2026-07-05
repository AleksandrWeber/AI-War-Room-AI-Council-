import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const shardingizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ShardingizabilityRolloutCheckStatus = z.infer<
  typeof shardingizabilityRolloutCheckStatusSchema
>

export const shardingizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: shardingizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ShardingizabilityRolloutCheck = z.infer<typeof shardingizabilityRolloutCheckSchema>

export const shardingizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ShardingizabilityRolloutStatus = z.infer<typeof shardingizabilityRolloutStatusSchema>

export const shardingizabilityCapabilitiesResponseSchema = z.object({
  supportsShardingizabilityRollout: z.literal(true),
  supportsShardingizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyShardingizabilitySignals: z.literal(true),
  supportsUsageEventShardingizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ShardingizabilityCapabilitiesResponse = z.infer<
  typeof shardingizabilityCapabilitiesResponseSchema
>

export const shardingizabilityRolloutResponseSchema = z.object({
  status: shardingizabilityRolloutStatusSchema,
  checks: z.array(shardingizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ShardingizabilityRolloutResponse = z.infer<
  typeof shardingizabilityRolloutResponseSchema
>

export function getShardingizabilityRolloutGuidance() {
  return 'Production shardingizability rollout validates idempotency key shardingizability, usage event shardingizability signals, billing webhook coverage, and shardingization readiness before production shardingizability tooling.'
}
